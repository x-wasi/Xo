 const axios = require('axios');
const fetch = require('node-fetch');
const config = require('../config');
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
        const [, username, repoName] = githubRepoURL.match(/github\.com\/([^/]+)\/([^/]+)/);
        const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`);

        if (!response.ok) throw new Error(`Erreur API GitHub : ${response.status}`);
        const repoData = await response.json();

        const author = repoData.owner.login;
        const repoInfo = {
            stars: repoData.stargazers_count,
            forks: repoData.forks_count,
            url: repoData.html_url
        };
        const createdDate = new Date(repoData.created_at).toLocaleDateString();
        const lastUpdateDate = new Date(repoData.updated_at).toLocaleDateString();
        const botname = "MEGALODON-MD";

        const styleCustom = `*ʜᴇʟʟᴏ ,,,👋 ᴛʜɪs ɪs ${botname}*
ᴛʜᴇ ʙᴇsᴛ ʙᴏᴛ ɪɴ ᴛʜᴇ ᴜɴɪᴠᴇʀsᴇ ᴅᴇᴠᴇʟᴏᴘᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ. ғᴏʀᴋ ᴀɴᴅ ɢɪᴠᴇ ᴀ sᴛᴀʀ 🌟 ᴛᴏ ᴍʏ ʀᴇᴘᴏ
╭───────────────────
│✞ *sᴛᴀʀs:* ${repoInfo.stars}
│✞ *ғᴏʀᴋs:* ${repoInfo.forks}
│✞ *ʀᴇʟᴇᴀsᴇ Date:* ${createdDate}
│✞ *ʟᴀsᴛ Update:* ${lastUpdateDate}
│✞ *ᴏᴡɴᴇʀ:* ${author}
│✞ *ʀᴇᴘᴏsɪᴛᴏʀʏ:* ${repoInfo.url}
│✞ *sᴇssɪᴏɴ:* meg-lodon-session.up.railway.app 
╰───────────────────`;

        // Télécharger l'image
        const thumbnailBuffer = await axios.get('https://files.catbox.moe/w1l8b0.jpg', { responseType: 'arraybuffer' }).then(res => res.data);

        // Envoyer le message avec image
        await conn.sendMessage(from, {
            image: thumbnailBuffer,
            caption: styleCustom,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401051937059@newsletter',
                    newsletterName: '𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (error) {
        console.error("Erreur commande repo:", error);
        reply(`❌ Erreur : ${error.message}`);
    }
});