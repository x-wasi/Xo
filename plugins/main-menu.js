const config = require('../config');
const moment = require('moment-timezone');
const { cmd, commands } = require('../command');

// Stylised uppercase (ʜɪ style)
function toUpperStylized(str) {
  const stylized = {
    A: 'ᴀ', B: 'ʙ', C: 'ᴄ', D: 'ᴅ', E: 'ᴇ', F: 'ғ', G: 'ɢ', H: 'ʜ',
    I: 'ɪ', J: 'ᴊ', K: 'ᴋ', L: 'ʟ', M: 'ᴍ', N: 'ɴ', O: 'ᴏ', P: 'ᴘ',
    Q: 'ǫ', R: 'ʀ', S: 's', T: 'ᴛ', U: 'ᴜ', V: 'ᴠ', W: 'ᴡ', X: 'x',
    Y: 'ʏ', Z: 'ᴢ'
  };
  return str.split('').map(c => stylized[c.toUpperCase()] || c).join('');
}

cmd({
  pattern: "menu",
  alias: ["💫", "mega", "allmenu"],
  use: '.menu',
  desc: "Show all bot commands",
  category: "menu",
  react: "💫",
  filename: __filename
},
async (dyby, mek, m, { from, reply }) => {
  try {
    const sender = m?.sender || mek?.key?.participant || mek?.key?.remoteJid || 'unknown@s.whatsapp.net';
    const totalCommands = commands.length;
    const date = moment().tz("America/Port-au-Prince").format("dddd, DD MMMM YYYY");
    const time = moment().tz("America/Port-au-Prince").format("HH:mm:ss");

    const uptime = () => {
      let sec = process.uptime();
      let h = Math.floor(sec / 3600);
      let m = Math.floor((sec % 3600) / 60);
      let s = Math.floor(sec % 60);
      return `${h}h ${m}m ${s}s`;
    };

    let dybymenu = `
*╭══〘 𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃 〙*
*┃◆* ᴜꜱᴇʀ : @${sender.split("@")[0]}
*┃◆* ʀᴜɴᴛɪᴍᴇ : ${uptime()}
*┃◆* ᴍᴏᴅᴇ : *${config.MODE}*
*┃◆* ᴘʀᴇғɪx : [${config.PREFIX}]
*┃◆* ᴘʟᴜɢɪɴꜱ : ${totalCommands}
*┃◆* ᴅᴇᴠ : ᴅʏʙʏ ᴛᴇᴄʜ
*┃◆* ᴠᴇʀꜱɪᴏɴ : 1.0.0
*╰════════════════⊷*`;

    let category = {};
    for (let cmd of commands) {
      if (!cmd.category) continue;
      if (!category[cmd.category]) category[cmd.category] = [];
      category[cmd.category].push(cmd);
    }

    const keys = Object.keys(category).sort();
    for (let k of keys) {
      dybymenu += `\n\n┌── 『 `*${toUpperStylized(k)} ᴍᴇɴᴜ*` 』`;
      const cmds = category[k].filter(c => c.pattern).sort((a, b) => a.pattern.localeCompare(b.pattern));
      cmds.forEach((cmd) => {
        const usage = cmd.pattern.split('|')[0];
        dybymenu += `\n├❃ ${config.PREFIX}${toUpperStylized(usage)}`;
      });
      dybymenu += `\n┗━━━━━━━━━━━━━━❃`;
    }

    await dyby.sendMessage(from, {
      image: { url: 'https://files.catbox.moe/2ozipw.jpg' },
      caption: dybymenu,
      contextInfo: {
        mentionedJid: [sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363401051937059@newsletter',
          newsletterName: '𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃',
          serverMessageId: 143
        }
      }
    }, { quoted: mek });

  } catch (e) {
    console.error("❌ Error in menu:", e);
    reply(`❌ Menu error: ${e.message}`);
  }
});
