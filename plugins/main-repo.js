const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { cmd } = require('../command');

cmd({
    pattern: "repo",
    alias: ["sc", "script", "info"],
    desc: "Obtenir les infos du dépôt GitHub",
    react: "📂",
    category: "info",
    filename: __filename,
},
async (conn, mek, m, { from, reply }) => {
    const githubRepoURL = 'https://github.com/DybyTech/MEGALODON-MD';

    try {
        const match = githubRepoURL.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) return reply("❌ ʟɪᴇɴ ɢɪᴛʜᴜʙ ɪɴᴠᴀʟɪᴅᴇ.");

        const [, username, repoName] = match;
        const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`);
        if (!response.ok) throw new Error(`Erreur API GitHub : ${response.status}`);
        const repoData = await response.json();

        const botname = "MEGALODON-MD";
        const author = repoData.owner?.login || "Inconnu";
        const repoInfo = {
            stars: repoData.stargazers_count,
            forks: repoData.forks_count,
            url: repoData.html_url
        };
        const createdDate = new Date(repoData.created_at).toLocaleDateString();
        const lastUpdateDate = new Date(repoData.updated_at).toLocaleDateString();

        const caption = `*ʜᴇʟʟᴏ ,,,👋 ᴛʜɪs ɪs ${botname}*
ᴛʜᴇ ʙᴇsᴛ ʙᴏᴛ ɪɴ ᴛʜᴇ ᴜɴɪᴠᴇʀsᴇ ᴅᴇᴠᴇʟᴏᴘᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ. ғᴏʀᴋ ᴀɴᴅ ɢɪᴠᴇ ᴀ sᴛᴀʀ 🌟 ᴛᴏ ᴍʏ ʀᴇᴘᴏ
╭───────────────────
│✞ *sᴛᴀʀs:* ${repoInfo.stars}
│✞ *ғᴏʀᴋs:* ${repoInfo.forks}
│✞ *ʀᴇʟᴇᴀsᴇ ᴅᴀᴛᴇ:* ${createdDate}
│✞ *ʟᴀsᴛ ᴜᴘᴅᴀᴛᴇ:* ${lastUpdateDate}
│✞ *ᴏᴡɴᴇʀ:* ${author}
│✞ *ʀᴇᴘᴏsɪᴛᴏʀʏ:* ${repoInfo.url}
│✞ *sᴇssɪᴏɴ:* meg-lodon-session.up.railway.app
╰───────────────────`;

        // Charger l'image locale
        const imagePath = path.join(__dirname, '../media/alive.png');
        if (!fs.existsSync(imagePath)) throw new Error("ɪᴍᴀɢᴇ ʟᴏᴄᴀʟᴇ ɴᴏɴ ᴛʀᴏᴜᴠéᴇ : ᴍᴇᴅɪᴀ/ᴀʟɪᴠᴇ.ᴘɴɢ");
        const imageBuffer = fs.readFileSync(imagePath);

        // Envoyer le message avec newsletter forwarding
        await conn.sendMessage(from, {
            image: imageBuffer,
            caption,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401051937059@newsletter',
                    newsletterName: '𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃',
                    serverMessageId: 143 // Assure-toi que ce messageId est valide
                }
            }
        }, { quoted: mek });

    } catch (error) {
        console.error("❌ Erreur commande repo:", error);
        reply(`❌ Erreur : ${error.message}`);
    }
});
