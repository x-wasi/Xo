const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');
const config = require('../config');

const dbPath = path.join(__dirname, '../data/antiviewonce.json');
let antiViewData = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath)) : {};

function saveData() {
  fs.writeFileSync(dbPath, JSON.stringify(antiViewData, null, 2));
}

cmd({
  pattern: "antiviewonce",
  alias: ["antiview"],
  desc: "Enable/Disable Anti-ViewOnce feature",
  category: "tools",
  filename: __filename
}, async (conn, m, msg, { from, args, isGroup, isAdmin, sender }) => {
  console.log("🧩 .antiviewonce command triggered");

  const isOwner = config.owner.includes(sender.replace(/[^0-9]/g, ''));
  const state = args[0] === 'on' ? true : args[0] === 'off' ? false : null;

  if (state === null)
    return msg.reply('🔁 Usage:\n.antiviewonce on\n.antiviewonce off');

  if (isGroup) {
    if (!isAdmin) return msg.reply('❌ Only group admins can use this.');
  } else {
    if (!isOwner) return msg.reply('❌ Only the bot owner can enable this in private chat.');
  }

  antiViewData[from] = state;
  saveData();
  return msg.reply(`✅ Anti-ViewOnce is now *${state ? 'enabled' : 'disabled'}* for this chat.`);
});

// This event handler listens for new messages and processes viewOnce messages automatically
cmd({
  pattern: '',
  filename: __filename,
  fromMe: false,
  dontAddCommandList: true,
}, async (conn, m) => {
  try {
    if (!m.message || !m.message.viewOnceMessage) return;

    const { key, message, pushName } = m;
    const from = key.remoteJid;
    const sender = key.participant || from;
    const isGroup = from.endsWith('@g.us');
    const isOwner = config.owner.includes(sender.replace(/[^0-9]/g, ''));

    if (isGroup) {
      if (!antiViewData[from]) return;
    } else {
      if (!antiViewData[from]) return;
      if (!isOwner) return;
    }

    const viewOnce = message.viewOnceMessage.message;
    const type = Object.keys(viewOnce)[0];
    const buffer = await conn.downloadMediaMessage(m);

    if (!buffer) return;

    let forwardData = {};
    if (type === 'imageMessage') {
      forwardData = {
        image: buffer,
        caption: `👁‍🗨 ViewOnce image received from ${pushName || 'Unknown'}`,
      };
    } else if (type === 'videoMessage') {
      forwardData = {
        video: buffer,
        caption: `🎞️ ViewOnce video received from ${pushName || 'Unknown'}`,
      };
    } else return;

    await conn.sendMessage(from, forwardData, { quoted: m });

  } catch (err) {
    console.error('❌ AntiViewOnce Error:', err);
  }
});
