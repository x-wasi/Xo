
const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "fancy2",
  alias: ["font2", "style2"],
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
    if (!q) return reply("❎ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ ᴛᴏ ᴄᴏɴᴠᴇʀᴛ.\n\n*ᴇxᴀᴍᴘʟᴇ:* .ғᴀɴᴄʏ ʜᴇʟʟᴏ");

    const apiUrl = `https://www.dark-yasiya-api.site/other/font?text=${encodeURIComponent(q)}`;
    const res = await axios.get(apiUrl);

    if (!res.data.status || !Array.isArray(res.data.result)) {
      return reply("❌ Error fetching fonts. Try again later.");
    }

    const fonts = res.data.result;
    const maxDisplay = 44;
    const displayList = fonts.slice(0, maxDisplay);

    let menuText = "╭──〔 *FΛПᄃY ƧƬYᄂΣƧ* 〕──⬣\n";
    displayList.forEach((f, i) => {
      menuText += `┃ ${i + 1}. ${f.result}\n`;
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
        const finalText = `✨ *Your Text in ${chosen.name || 'Selected Style'}:*\n\n${chosen.result}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*`;

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
