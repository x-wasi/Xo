const axios = require('axios');
const fetch = require('node-fetch');
const config = require('../config');
const { cmd } = require('../command');

cmd({
    pattern: "repo",
    alias: ["sc", "script", "info"],
    desc: "Fetch GitHub repository information",
    react: "📂",
    category: "info",
    filename: __filename,
},
async (conn, mek, m, { from, reply }) => {
    const githubRepoURL = 'https://github.com/DybyTech/MEGALODON-MD';

    try {
        const [, username, repoName] = githubRepoURL.match(/github\.com\/([^/]+)\/([^/]+)/);
        const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`);
        
        if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
        const repoData = await response.json();

        // Format 1: Classic Box
        const style1 = `╭──『 𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃 REPO 』──⳹
│
│ 📦 *Repository*: ${repoData.name}
│ 👑 *Owner*: ${repoData.owner.login}
│ ⭐ *Stars*: ${repoData.stargazers_count}
│ ⑂ *Forks*: ${repoData.forks_count}
│ 🔗 *URL*: ${repoData.html_url}
│
│ 📝 *Description*:
│ ${repoData.description || 'No description'}
│
╰────────────────⳹
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*`;

    

        // Format 4: Code Style
        const style4 = `┌──────────────────────┐
│  ⚡ 𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃 REPO   
├──────────────────────
│ • Name: ${repoData.name}
│ • Owner: ${repoData.owner.login}
│ • Stars: ${repoData.stargazers_count}
│ • Forks: ${repoData.forks_count}
│ • URL: ${repoData.html_url}
│ • Desc: ${repoData.description || 'None'}
└──────────────────────┘
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*`;

        // Format 5: Modern Blocks
        const style5 = `▰▰▰▰▰ REPO INFO ▰▰▰▰▰

  🏷️  *${repoData.name}*
  👨‍💻  ${repoData.owner.login}
  
  ⭐ ${repoData.stargazers_count}  ⑂ ${repoData.forks_count}
  🔗 ${repoData.html_url}
  
  📜 ${repoData.description || 'No description'}
  
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*`;

        // Format 6: Retro Terminal
        const style6 = `╔══════════════════════╗
║   𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃 REPO    ║
╠══════════════════════╣
║ NAME: ${repoData.name}
║ OWNER: ${repoData.owner.login}
║ STARS: ${repoData.stargazers_count}
║ FORKS: ${repoData.forks_count}
║ URL: ${repoData.html_url}
║ DESC: ${repoData.description || 'None'}
╚══════════════════════╝
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*`;

        

        // Format 8: Social Media Style
        const style8 = `✦ 𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃 Repository ✦

📌 *${repoData.name}*
👤 @${repoData.owner.login}

⭐ ${repoData.stargazers_count} Stars | ⑂ ${repoData.forks_count} Forks
🔄 Last updated: ${new Date(repoData.updated_at).toLocaleDateString()}

🔗 GitHub: ${repoData.html_url}

${repoData.description || 'No description available'}

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*`;


        // Format 10: Professional
        const style10 = `┏━━━━━━━━━━━━━━━━━━┓
┃  REPOSITORY REPORT  ┃
┗━━━━━━━━━━━━━━━━━━┛

◈ Project: ${repoData.name}
◈ Maintainer: ${repoData.owner.login}
◈ Popularity: ★ ${repoData.stargazers_count} | ⑂ ${repoData.forks_count}
◈ Last Update: ${new Date(repoData.updated_at).toLocaleDateString()}
◈ URL: ${repoData.html_url}

Description:
${repoData.description || 'No description provided'}

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍᴇɢᴀʟᴏᴅᴏɴ ᴍᴅ*`;

        const styles = [style1, style4, style5, style6, style8, style10];
        const selectedStyle = styles[Math.floor(Math.random() * styles.length)];

        // Send image with repo info
        const thumbnailBuffer = await axios.get('https://files.catbox.moe/c811p6.jpg', { responseType: 'arraybuffer' }).then(res => res.data);

        await conn.sendMessage(from, {
    text: selectedStyle, // <-- au lieu de caption
    contextInfo: {
        externalAdReply: {
            title: "𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃",
            body: "© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ",
            mediaType: 1,
            previewType: "PHOTO",
            renderLargerThumbnail: true,
            thumbnail: thumbnailBuffer,
            mediaUrl: "https://wa.me/message/yourself",
            sourceUrl: "https://wa.me/message/yourself"
        }
    }
}, { quoted: mek });

        
    } catch (error) {
        console.error("Repo command error:", error);
        reply(`❌ Error: ${error.message}`);
    }
});
