const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "mediafire",
  alias: ["mfire", "mfdownload"],
  react: '📥',
  desc: "Download files from MediaFire",
  category: "download",
  use: ".mediafire <MediaFire URL>",
  filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
  try {
    const url = args[0];
    if (!url || !url.includes("mediafire.com")) {
      return reply("❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ᴍᴇᴅɪᴀғɪʀᴇ ᴜʀʟ\nᴇxᴀᴍᴘʟᴇ: .ᴍᴇᴅɪᴀғɪʀᴇ https://www.mediafire.com/file/...");
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    const apiUrl = `https://apis.davidcyriltech.my.id/mediafire?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.downloadLink) {
      return reply("❌ ғᴀɪʟᴇᴅ ᴛᴏ ғᴇᴛᴄʜ ғɪʟᴇ ɪɴғᴏ. ɪɴᴠᴀʟɪᴅ ᴜʀʟ ᴏʀ ᴀᴘɪ ᴇʀʀᴏʀ.");
    }

    await reply(`📥 ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ғɪʟᴇ (${data.size})...`);

    const fileResponse = await axios.get(data.downloadLink, { responseType: 'arraybuffer' });
    const fileBuffer = Buffer.from(fileResponse.data);

    const messageOptions = {
      document: fileBuffer,
      fileName: data.fileName,
      mimetype: data.mimeType,
      caption: `*ᴍᴇᴅɪᴀғɪʀᴇ ᴅᴏᴡɴʟᴏᴀᴅ*\n\n📄 *Size:* ${data.size}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ`
    };

    await conn.sendMessage(from, messageOptions, { quoted: mek });
    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error("MediaFire Error:", error);
    reply("❌ Failed to download file. Please try again later.");
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});
