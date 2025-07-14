const { cmd } = require('../command');
const { runtime } = require('../lib/functions');
const os = require('os');
const config = require('../config');

cmd({
  pattern: "alive",
  alias: ["botstatus", "status"],
  desc: "Show styled alive menu",
  category: "main",
  react: "💠",
  filename: __filename
}, async (conn, m, msg, { pushName }) => {
  try {
    const uptime = runtime(process.uptime());
    const userNumber = m.sender.split("@")[0];
    const totalSession = Object.keys(await conn.chats.all()).length;

    const caption = `╭───『 ʜɪ ${pushName || "ᴜꜱᴇʀ"} 』───◆
│ 💠 ʙᴏᴛ ɪꜱ ʀᴜɴɴɪɴɢ ꜱᴍᴏᴏᴛʜʟʏ
│
│ ⏱️ ᴜᴘᴛɪᴍᴇ: ${uptime}
│ 🔧 *ʙᴏᴛ ɴᴀᴍᴇ:* ${botname}
│ 👑 *ᴏᴡɴᴇʀ:* ${config.OWNER_NAME}
│ 📱 ʏᴏᴜʀ ɴᴜᴍʙᴇʀ: ${userNumber}
╰────────────────────◆

🌐 ꜱɪᴛᴇ: https://meg-lodon-session.onrender.com 
📌 ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍᴇɢᴀʟᴏᴅᴏɴ-ᴍᴅ 💜`;

    await conn.sendMessage(m.chat, {
      image: { url: 'https://files.catbox.moe/7jylpj.jpg' }, // remplace avec ton image
      caption: caption,
      footer: "ꜱᴜʟᴀ-ᴍᴅ ʙᴏᴛ | ᴅʏʙʏᴛᴇᴄʜ",
      buttons: [
        { buttonId: `${config.PREFIX}menu`, buttonText: { displayText: "↩️ ᴍᴇɴᴜ" }, type: 1 },
        { buttonId: `${config.PREFIX}owner`, buttonText: { displayText: "👑 ᴏᴡɴᴇʀ" }, type: 1 },
        { buttonId: `https://meg-lodon-session.onrender.com`, buttonText: { displayText: "🌐 ᴄʟɪᴄᴋ ʜᴇʀᴇ" }, type: 1 },
      ],
      headerType: 4
    }, { quoted: m });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { text: "❌ ᴀɴ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ ᴡʜɪʟᴇ ꜱᴇɴᴅɪɴɢ ᴀʟɪᴠᴇ ᴍᴇɴᴜ." }, { quoted: m });
  }
});
