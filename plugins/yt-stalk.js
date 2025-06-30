const { cmd } = require('../command');
const axios = require('axios');

cmd({
  pattern: "ytstalk",
  alias: ["ytinfo"],
  desc: "Get details about a YouTube channel.",
  react: "🔍",
  category: "tools",
  filename: __filename
}, async (conn, m, store, { from, quoted, q, reply }) => {
  try {
    if (!q) {
      return reply("❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ʏᴏᴜᴛᴜʙᴇ ᴄʜᴀɴɴᴇʟ ᴜsᴇʀɴᴀᴍᴇ ᴏʀ ɪᴅ.");
    }

    await conn.sendMessage(from, {
      react: { text: "⏳", key: m.key }
    });

    const apiUrl = `https://delirius-apiofc.vercel.app/tools/ytstalk?channel=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.status || !data.data) {
      return reply("⚠️ Failed to fetch YouTube channel details. Ensure the username or ID is correct.");
    }

    const yt = data.data;
    const caption = `╭━━━〔 *𝐘𝐎𝐔𝐓𝐔𝐁𝐄 𝐒𝐓𝐀𝐋𝐊𝐄𝐑* 〕━━━⊷\n`
      + `┃👤 *ᴜsᴇʀɴᴀᴍᴇ:* ${yt.username}\n`
      + `┃📊 *sᴜʙsᴄʀɪʙᴇʀs:* ${yt.subscriber_count}\n`
      + `┃🎥 *ᴠɪᴅᴇᴏs:* ${yt.video_count}\n`
      + `┃🔗 *ᴄʜᴀɴɴᴇʟ ʟɪɴᴋ:* (${yt.channel})\n`
      + `╰━━━⪼\n\n`
      + `🔹 *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*`;

    await conn.sendMessage(from, {
      image: { url: yt.avatar },
      caption: caption
    }, { quoted: m });

  } catch (error) {
    console.error("Error:", error);
    reply("❌ An error occurred while processing your request. Please try again.");
  }
});
