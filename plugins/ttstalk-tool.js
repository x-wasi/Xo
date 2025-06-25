const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "tiktokstalk",
  alias: ["tstalk", "ttstalk"],
  react: "📱",
  desc: "Fetch TikTok user profile details.",
  category: "search",
  filename: __filename
}, async (conn, m, store, { from, args, q, reply }) => {
  try {
    if (!q) {
      return reply("❎ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴛɪᴋᴛᴏᴋ ᴜsᴇʀɴᴀᴍᴇ.\n\n*ᴇxᴀᴍᴘʟᴇ:* .ᴛɪᴋᴛᴏᴋsᴛᴀʟᴋ ᴍʀʙᴇᴀsᴛ");
    }

    const apiUrl = `https://api.siputzx.my.id/api/stalk/tiktok?username=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.status) {
      return reply("❌ ᴜsᴇʀ ɴᴏᴛ ғᴏᴜɴᴅ. ᴘʟᴇᴀsᴇ ᴄʜᴇᴄᴋ ᴛʜᴇ ᴜsᴇʀɴᴀᴍᴇ ᴀɴᴅ ᴛʀʏ ᴀɢᴀɪɴ.");
    }

    const user = data.data.user;
    const stats = data.data.stats;

    const profileInfo = `🎭 *𝐓𝐢𝐤𝐓𝐨𝐤 𝐏𝐫𝐨𝐟𝐢𝐥𝐞 𝐒𝐭𝐚𝐥𝐤𝐞𝐫* 🎭

👤 *ᴜsᴇʀɴᴀᴍᴇ:* @${user.uniqueId}
📛 *ɴɪᴄᴋɴᴀᴍᴇ:* ${user.nickname}
✅ *ᴠᴇʀɪғɪᴇᴅ:* ${user.verified ? "Yes ✅" : "No ❌"}
📍 *ʀᴇɢɪᴏɴ:* ${user.region}
📝 *ʙɪᴏ:* ${user.signature || "No bio available."}
🔗 *ʙɪᴏ ʟɪɴᴋ:* ${user.bioLink?.link || "No link available."}

📊 *sᴛᴀᴛɪsᴛɪᴄs:*
👥 *ғᴏʟʟᴏᴡᴇʀs:* ${stats.followerCount.toLocaleString()}
👤 *ғᴏʟʟᴏᴡɪɴɢ:* ${stats.followingCount.toLocaleString()}
❤️ *ʟɪᴋᴇs:* ${stats.heartCount.toLocaleString()}
🎥 *ᴠɪᴅᴇᴏs:* ${stats.videoCount.toLocaleString()}

📅 *ᴀᴄᴄᴏᴜɴᴛ ᴄʀᴇᴀᴛᴇᴅ:* ${new Date(user.createTime * 1000).toLocaleDateString()}
🔒 *ᴘʀɪᴠᴀᴛᴇ ᴀᴄᴄᴏᴜɴᴛ:* ${user.privateAccount ? "Yes 🔒" : "No 🌍"}

🔗 *ᴘʀᴏғɪʟᴇ ᴜʀʟ:* https://www.tiktok.com/@${user.uniqueId}
`;

    const profileImage = { image: { url: user.avatarLarger }, caption: profileInfo };

    await conn.sendMessage(from, profileImage, { quoted: m });
  } catch (error) {
    console.error("❌ Error in TikTok stalk command:", error);
    reply("⚠️ An error occurred while fetching TikTok profile data.");
  }
});

