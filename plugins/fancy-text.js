const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "fancy",
  alias: ["font", "style"],
  react: "✍️",
  desc: "Convert text into various fancy fonts.",
  category: "tools",
  filename: __filename
}, async (conn, mek, m, {
  from,
  quoted,
  body,
  isCmd,
  command,
  args,
  q,
  reply
}) => {
  try {
    if (!q) return reply("❎ ρℓєαѕє ρяσνι∂є тєχт тσ ¢σηνєят.\n\n*єχαмρℓє:* .ƒαη¢у нєℓℓσ");

    const apiUrl = `https://billowing-waterfall-dbab.bot1newnew.workers.dev/?word=${encodeURIComponent(q)}`;
    const res = await axios.get(apiUrl);

    if (!Array.isArray(res.data)) {
      return reply("❌ Error fetching fonts. Try again later.");
    }

    const fonts = res.data;
    const maxDisplay = 44;
    const displayList = fonts.slice(0, maxDisplay);

    let menuText = "╭──〔 *𝐅𝐀𝐍𝐂𝐘 𝐒𝐓𝐘𝐋𝐄𝐒* 〕──⬣\n";
    displayList.forEach((f, i) => {
      menuText += `┃ ${i + 1}. ${f}\n`;
    });
    menuText += "╰──────────────⬣\n\n📌 *ʀᴇᴘʟʏ ᴡɪᴛʜ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴛᴏ sᴇʟᴇᴄᴛ ᴀ ғᴏɴᴛ sᴛʏʟᴇ ғᴏʀ:*\n❝ " + q + " ❞";

    const sentMsg = await conn.sendMessage(from, {
      text: menuText
    }, { quoted: m });

    const messageID = sentMsg.key.id;

    const messageHandler = async (msgData) => {
      const receivedMsg = msgData.messages?.[0];
      if (!receivedMsg || !receivedMsg.message) return;

      const receivedText = receivedMsg.message.conversation ||
        receivedMsg.message.extendedTextMessage?.text;

      const senderID = receivedMsg.key.remoteJid;
      const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

      if (isReplyToBot && senderID === from) {
        const selectedNumber = parseInt(receivedText.trim());
        if (isNaN(selectedNumber) || selectedNumber < 1 || selectedNumber > displayList.length) {
          return conn.sendMessage(from, {
            text: "❎ ɪɴᴠᴀʟɪᴅ sᴇʟᴇᴄᴛɪᴏɴ. ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴡɪᴛʜ ᴀ ɴᴜᴍʙᴇʀ ғʀᴏᴍ 1 ᴛᴏ " + displayList.length + ".",
          }, { quoted: receivedMsg });
        }

        const chosen = displayList[selectedNumber - 1];
        const finalText = `✨ *ʏᴏᴜʀ ᴛᴇxᴛ ɪɴ sᴇʟᴇᴄᴛᴇᴅ sᴛʏʟᴇ:*\n\n${chosen}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*`;

        await conn.sendMessage(from, {
          text: finalText
        }, { quoted: receivedMsg });
      }
    };

    conn.ev.on("messages.upsert", messageHandler);
  } catch (error) {
    console.error("❌ Error in .fancy:", error);
    reply("⚠️ An error occurred while processing.");
  }
});
