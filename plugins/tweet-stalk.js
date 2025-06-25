const { cmd } = require('../command');
const axios = require('axios');

cmd({
  pattern: "xstalk",
  alias: ["twitterstalk", "twtstalk"],
  desc: "Get details about a Twitter/X user.",
  react: "🔍",
  category: "search",
  filename: __filename
}, async (conn, m, store, { from, quoted, q, reply }) => {
  try {
    if (!q) {
      return reply("❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ᴛᴡɪᴛᴛᴇʀ/x ᴜsᴇʀɴᴀᴍᴇ.");
    }

    await conn.sendMessage(from, {
      react: { text: "⏳", key: m.key }
    });

    const apiUrl = `https://delirius-apiofc.vercel.app/tools/xstalk?username=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.status || !data.data) {
      return reply("⚠️ Failed to fetch Twitter/X user details. Ensure the username is correct.");
    }

    const user = data.data;
    const verifiedBadge = user.verified ? "✅" : "❌";

    const caption = `╭━━━〔 *ᴛᴡɪᴛᴛᴇʀ/x sᴛᴀʟᴋᴇʀ* 〕━━━⊷\n`
      + `┃👤 *ɴᴀᴍᴇ:* ${user.name}\n`
      + `┃🔹 *ᴜsᴇʀɴᴀᴍᴇ:* @${user.username}\n`
      + `┃✔️ *ᴠᴇʀɪғɪᴇᴅ:* ${verifiedBadge}\n`
      + `┃👥 *ғᴏʟʟᴏᴡᴇʀs:* ${user.followers_count}\n`
      + `┃👤 *ғᴏʟʟᴏᴡɪɴɢ:* ${user.following_count}\n`
      + `┃📝 *ᴛᴡᴇᴇᴛs:* ${user.tweets_count}\n`
      + `┃📅 *ᴊᴏɪɴᴇᴅ:* ${user.created}\n`
      + `┃🔗 *ᴘʀᴏғɪʟᴇ:* [Click Here](${user.url})\n`
      + `╰━━━⪼\n\n`
      + `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*`;

    await conn.sendMessage(from, {
      image: { url: user.avatar },
      caption: caption
    }, { quoted: m });

  } catch (error) {
    console.error("Error:", error);
    reply("❌ An error occurred while processing your request. Please try again.");
  }
});
