const config = require('../config');
const { cmd, commands } = require('../command');

cmd({
  pattern: "menu2",
  alias: ["mainmenu", "help2"],
  desc: "Interactive menu with categories",
  category: "menu",
  react: "🧾",
  filename: __filename
}, async (conn, mek, m, {
  from, sender, pushname, reply
}) => {
  try {
    const categories = {
      '1': 'download',
      '2': 'group',
      '3': 'fun',
      '4': 'owner',
      '5': 'ai',
      '6': 'anime',
      '7': 'convert',
      '8': 'other',
      '9': 'reactions',
      '10': 'main'
    };

    const getGreeting = () => {
      const h = new Date().getHours();
      if (h >= 5 && h < 12) return "ɢᴏᴏᴅ ᴍᴏʀɴɪɴɢ 🌅";
      if (h >= 12 && h < 18) return "ɢᴏᴏᴅ ᴀꜰᴛᴇʀɴᴏᴏɴ 🌞";
      return "ɢᴏᴏᴅ ᴇᴠᴇɴɪɴɢ 🌚";
    };

    const menuCaption = `*┌──◆*
*│ 『 𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃 』*
*└─┬◆*
*┌─┤ ${getGreeting()}*
*│  ╰────────────────╯*
*│◓ ᴜsᴇʀ : ${pushname}
*│◓ ᴏᴡɴᴇʀ : ${config.OWNER_NAME}*
*│◓ ʙᴀɪʟᴇʏs : ᴍᴜʟᴛɪ ᴅᴇᴠɪᴄᴇ*
*│◓ ᴛʏᴘᴇ : ɴᴏᴅᴇᴊs*
*│◓ ᴅᴇᴠ : ᴅʏʙʏ ᴛᴇᴄʜ*
*│◓ ᴍᴏᴅᴇ : ${config.MODE}*
*│◓ ᴘʀᴇғɪx :*「 ${config.PREFIX} 」
*│◓ ᴠᴇʀsɪᴏɴ : 1.0.0 ʙᴇᴛᴀ*
*╰─────────────────⊷*

> *╭∘━━➣* *𝐌𝐄𝐍𝐔 *
> *│☆* ❶ *ᴅᴏᴡɴʟᴏᴀᴅ ᴍᴇɴᴜ*
> *│☆* ❷ *ɢʀᴏᴜᴘ ᴍᴇɴᴜ*
> *│☆* ❸ *ғᴜɴ ᴍᴇɴᴜ*
> *│☆* ❹ *ᴏᴡɴᴇʀ ᴍᴇɴᴜ*
> *│☆* ❺ *ᴀɪ ᴍᴇɴᴜ*
> *│☆* ❻ *ᴀɴɪᴍᴇ ᴍᴇɴᴜ*
> *│☆* ❼ *ᴄᴏɴᴠᴇʀᴛ ᴍᴇɴᴜ*
> *│☆* ❽ *ᴏᴛʜᴇʀ ᴍᴇɴᴜ*
> *│☆* ❾ *ʀᴇᴀᴄᴛɪᴏɴs ᴍᴇɴᴜ*
> *│☆* ➓ *ᴍᴀɪɴ ᴍᴇɴᴜ*
> *╰─────────────┈⊷*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*

_ʀᴇᴘʟʏ ᴡɪᴛʜ ᴀ ɴᴜᴍʙᴇʀ (1–10) ᴛᴏ ᴠɪᴇᴡ ᴛʜᴇ sᴜʙᴍᴇɴᴜ._`;

    const sent = await conn.sendMessage(from, {
      image: { url: 'https://files.catbox.moe/roubzi.jpg' },
      caption: menuCaption,
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
    }, { quoted: m });

    const messageID = sent.key.id;

    const messageHandler = async (msgData) => {
      const received = msgData.messages?.[0];
      if (!received || !received.message) return;

      const text = received.message.conversation ||
        received.message.extendedTextMessage?.text;
      const stanzaId = received.message?.extendedTextMessage?.contextInfo?.stanzaId;
      const senderJid = received.key.remoteJid;

      if (stanzaId === messageID && senderJid === from) {
        const choice = text?.trim();
        const cat = categories[choice];
        if (!cat) {
          return conn.sendMessage(from, {
            text: "❌ ɪɴᴠᴀʟɪᴅ ɴᴜᴍʙᴇʀ. ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ 1–10."
          }, { quoted: received });
        }

        const list = commands.filter(cmd => cmd.category?.toLowerCase() === cat)
          .map(cmd => `> |➳ *${config.PREFIX}${cmd.pattern}*`)
          .join("\n") || "_No commands found in this category._";

        await conn.sendMessage(from, {
          text: `> *📂 ${cat.toUpperCase()} MENU*\n\n${list}`
        }, { quoted: received });
      }
    };

    conn.ev.on("messages.upsert", messageHandler);

  } catch (err) {
    console.error("❌ menu2 error:", err);
    reply("⚠️ Error showing menu.");
  }
});
