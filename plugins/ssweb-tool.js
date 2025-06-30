// code by ⿻ ⌜ 𖤐

const axios = require("axios");
const config = require('../config');
const { cmd } = require('../command');

cmd({
  pattern: "ss",
  alias: ["ssweb"],
  react: "💫",
  desc: "Download screenshot of a given link.",
  category: "tools",
  use: ".ss <link>",
  filename: __filename,
}, 
async (conn, mek, m, {
  from, l, quoted, body, isCmd, command, args, q, isGroup, sender, 
  senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, 
  groupMetadata, groupName, participants, isItzcp, groupAdmins, 
  isBotAdmins, isAdmins, reply 
}) => {
  if (!q) {
    return reply("ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴜʀʟ ᴛᴏ ᴄᴀᴘᴛᴜʀᴇ ᴀ sᴄʀᴇᴇɴsʜᴏᴛ.");
  }

  try {
    // created by jawad tech 
    const response = await axios.get(`https://api.davidcyriltech.my.id/ssweb?url=${q}`);
    const screenshotUrl = response.data.screenshotUrl;

    // give credit and use
    const imageMessage = {
      image: { url: screenshotUrl },
      caption: "*ᴡᴇʙ ss ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*"};

    await conn.sendMessage(from, imageMessage, { quoted: m });
  } catch (error) {
    console.error(error);
    reply("Failed to capture the screenshot. Please try again.");
  }
});

// ⿻ ⌜𖤐
