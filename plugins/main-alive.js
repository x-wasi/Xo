const { cmd } = require('../command');
const os = require("os");
const fs = require("fs");
const moment = require("moment-timezone");
const { runtime } = require('../lib/functions');
const config = require('../config');
const axios = require("axios");

cmd({
    pattern: "alive",
    alias: ["mega", "live"],
    desc: "Check bot is alive or not",
    category: "main",
    react: ["🤍", "🌟", "🗿", "🥋", "💫", "☠", "🤍"][Math.floor(Math.random() * 7)],
    filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
    try {
        const time = moment().tz("America/Port-au-Prince").format("HH:mm:ss");
        const date = moment().tz("America/Port-au-Prince").format("DD/MM/YYYY");

        const imagePath = './media/alive.jpg';
        if (!fs.existsSync(imagePath)) return reply("❌ Image 'alive.jpg' introuvable dans /media.");
        const imageBuffer = fs.readFileSync(imagePath);

        // Récupère la photo de profil de l'utilisateur
        let thumb;
        try {
            const ppUrl = await conn.profilePictureUrl(sender, 'image');
            const res = await axios.get(ppUrl, { responseType: "arraybuffer" });
            thumb = Buffer.from(res.data);
        } catch {
            // Si l'utilisateur n'a pas de photo de profil
            thumb = fs.readFileSync(imagePath); // Utilise l'image par défaut comme fallback
        }

        const caption = 
`╭━━━━〔 *🤖 𝐁𝐎𝐓 𝐒𝐓𝐀𝐓𝐔𝐒* 〕━━━⬣
┃🟢 *𝐎𝐧𝐥𝐢𝐧𝐞 & 𝐖𝐨𝐫𝐤𝐢𝐧𝐠!*
┃━━━━━━━━━━━━━━━━━━━━⬣
┃👨‍💻 *ᴅᴇᴠᴇʟᴏᴘᴇʀ:* ᴅʏʙʏ ᴛᴇᴄʜ
┃📦 *ᴠᴇʀsɪᴏɴ:* 1.0.0
┃🔖 *ᴘʀᴇғɪx:* [${config.PREFIX}]
┃🚀 *ᴍᴏᴅᴇ:* ${config.MODE}
┃🖥 *ʜᴏsᴛ:* ${os.hostname()}
┃⏳ *ᴜᴘᴛɪᴍᴇ:* ${runtime(process.uptime())}
┃📅 *ᴅᴀᴛᴇ:* ${date}
┃⏰ *ᴛɪᴍᴇ:* ${time}
╰━━━━━━━━━━━━━━━━━━━━⬣

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*`;

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
                    serverMessageId: 143
                },
                externalAdReply: {
                    showAdAttribution: true,
                    title: "𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃",
                    body: "ᴘʀᴏғɪʟ ᴅᴇ " + (m.pushName || "utilisateur"),
                    mediaType: 1,
                    previewType: "PHOTO",
                    thumbnail: thumb,
                    sourceUrl: "https://wa.me/" + config.OWNER_NUMBER
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("❌ Alive Error:", e);
        reply(`❌ Une erreur est survenue : ${e.message}`);
    }
});
