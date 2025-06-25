const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "srepo",
  desc: "Fetch information about a GitHub repository.",
  category: "search",
  react: "🍃",
  filename: __filename
}, async (conn, m, store, { from, args, reply }) => {
  try {
    const repoName = args.join(" ");
    if (!repoName) {
      return reply("❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ɢɪᴛʜᴜʙ ʀᴇᴘᴏsɪᴛᴏʀʏ ɪɴ ᴛʜᴇ ғᴏʀᴍᴀᴛ 📌 `ᴏᴡɴᴇʀ/ʀᴇᴘᴏ`.");
    }

    const apiUrl = `https://api.github.com/repos/${repoName}`;
    const { data } = await axios.get(apiUrl);

    let responseMsg = `📁 *𝐆𝐢𝐭𝐇𝐮𝐛 𝐑𝐞𝐩𝐨𝐬𝐢𝐭𝐨𝐫𝐲 𝐈𝐧𝐟𝐨* 📁\n\n`;
    responseMsg += `📌 *ɴᴀᴍᴇ*: ${data.name}\n`;
    responseMsg += `🔗 *ᴜʀʟ*: ${data.html_url}\n`;
    responseMsg += `📝 *ᴅᴇsᴄʀɪᴘᴛɪᴏɴ*: ${data.description || "No description"}\n`;
    responseMsg += `⭐ *sᴛᴀʀs*: ${data.stargazers_count}\n`;
    responseMsg += `🍴 *ғᴏʀᴋs*: ${data.forks_count}\n`;
    responseMsg += `👤 *ᴏᴡɴᴇʀ*: ${data.owner.login}\n`;
    responseMsg += `📅 *ᴄʀᴇᴀᴛᴇᴅ At*: ${new Date(data.created_at).toLocaleDateString()}\n`;
    responseMsg += `\n> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*`;

    await conn.sendMessage(from, { text: responseMsg }, { quoted: m });
  } catch (error) {
    console.error("GitHub API Error:", error);
    reply(`❌ Error fetching repository data: ${error.response?.data?.message || error.message}`);
  }
});
