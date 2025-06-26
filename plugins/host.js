const { cmd } = require('../command');
const os = require('os');
const https = require('https');
const fs = require('fs');

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

function formatBytes(bytes) {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}

function detectCloudProvider(ip) {
  if (!ip) return 'Unknown';
  if (ip.startsWith('34.') || ip.startsWith('35.')) return 'Google Cloud Platform';
  if (ip.startsWith('52.') || ip.startsWith('54.')) return 'Amazon AWS';
  if (ip.startsWith('40.')) return 'Microsoft Azure';
  if (ip.startsWith('139.59.') || ip.startsWith('178.62.')) return 'DigitalOcean';
  return 'Unknown Provider';
}

// Détection du panel ou hébergeur via variables d'env ou fichiers connus
function detectPanel() {
  if (process.env.DYNO) return 'Heroku';
  if (process.env.VERCEL) return 'Vercel';
  if (process.env.RAILWAY_ENVIRONMENT) return 'Railway';
  if (process.env.RENDER) return 'Render';

  try {
    if (fs.existsSync('/usr/local/cpanel')) return 'cPanel';
    if (fs.existsSync('/etc/plesk-release')) return 'Plesk';
    if (fs.existsSync('/etc/cloudpanel')) return 'CloudPanel';
    if (fs.existsSync('/usr/local/vesta')) return 'VestaCP';
    if (fs.existsSync('/etc/directadmin')) return 'DirectAdmin';
  } catch {
    // ignore errors
  }
  return 'Unknown panel or plain server';
}

function getPublicIp() {
  return new Promise((resolve) => {
    https.get('https://api.ipify.org?format=json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.ip || 'Unknown');
        } catch {
          resolve('Unknown');
        }
      });
    }).on('error', () => resolve('Unavailable'));
  });
}

cmd({
  pattern: 'host',
  alias: ['hostinfo'],
  desc: 'Show detailed hosting info and uptime',
  category: 'info',
  react: '🌐',
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  try {
    const uptime = process.uptime();
    const hostname = os.hostname();

    // IP locale
    const interfaces = os.networkInterfaces();
    let localIp = 'Unknown';
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          localIp = iface.address;
          break;
        }
      }
      if (localIp !== 'Unknown') break;
    }

    // IP publique
    const publicIp = await getPublicIp();

    // Load average (1,5,15 min)
    const loads = os.loadavg().map(l => l.toFixed(2)).join(', ');

    // RAM
    const totalMem = formatBytes(os.totalmem());
    const freeMem = formatBytes(os.freemem());
    const usedMem = formatBytes(os.totalmem() - os.freemem());

    // OS info
    const platform = os.platform();
    const arch = os.arch();

    // Cloud provider
    const cloudProvider = detectCloudProvider(publicIp);

    // Panel / hébergeur
    const panel = detectPanel();

    const text = `
🌐 *Host Info*

Hostname      : ${hostname}
Local IP      : ${localIp}
Public IP     : ${publicIp}
Cloud Provider: ${cloudProvider}
Panel / Host  : ${panel}

🕒 Uptime      : ${formatUptime(uptime)}
💻 Load Avg.   : ${loads} (1m, 5m, 15m)

🧠 RAM Usage   : ${usedMem} / ${totalMem} (Free: ${freeMem})
🖥️ OS         : ${platform} (${arch})
    `.trim();

    await conn.sendMessage(m.chat, { text }, { quoted: mek });
  } catch (e) {
    console.error('❌ HOST ERROR:', e);
    reply('❌ Error retrieving host info.');
  }
});
