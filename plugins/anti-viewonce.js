const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');
const config = require('../config'); // Make sure config.owner contains your owner numbers

const dbPath = path.join(__dirname, '../data/antiviewonce.json');
let antiViewData = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath)) : {};

function saveData() {
  fs.writeFileSync(dbPath, JSON.stringify(antiViewData, null, 2));
}

cmd({
  pattern: "antiviewonce",
  alias: ["antiview"],
  desc: "Enable/Disable Anti-ViewOnce",
  category: "tools",
  filename: __filename
}, async (conn, m, msg, { from, args, isGroup, isAdmin, sender }) => {
  const isOwner = config.owner.includes(sender.replace(/[^0-9]/g, ''));
  const state = args[0] === 'on' ? true : args[0] === 'off' ? false : null;
  if (state === null) return msg.reply('🔁 Usage:\n.antiviewonce on\n.antiviewonce off');

  if (isGroup) {
    if (!isAdmin) return msg.reply('❌ Only admins can change this setting in group.');
  } else {
    if (!isOwner) return msg.reply('❌ You are not allowed to use this command in private chat (owner only).');
  }

  antiViewData[from] = state;
  saveData();
  return msg.reply(`✅ Anti-ViewOnce is now *${state ? 'enabled' : 'disabled'}* for this chat.`);
});

module.exports = {
  onViewOnceMessage: async (conn, msg) => {
    try {
      const { key, message, pushName } = msg;
      const from = key.remoteJid;
      const sender = key.participant || from;

      const isGroup = from.endsWith('@g.us');
      const isOwner = config.owner.includes(sender.replace(/[^0-9]/g, ''));

      // 👥 Group: respect group setting
      // 💬 Private: allow only if owner
      if (isGroup) {
        if (!antiViewData[from]) return;
      } else {
        if (!antiViewData[from]) return;
        if (!isOwner) return;
      }

      const viewOnce = message.viewOnceMessage?.message;
      if (!viewOnce) return;

      const type = Object.keys(viewOnce)[0];
      const mediaMsg = viewOnce[type];
      const buffer = await conn.downloadMediaMessage(msg);

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

      await conn.sendMessage(from, forwardData, { quoted: msg });
    } catch (e) {
      console.error('❌ AntiViewOnce Error:', e);
    }
  }
};
