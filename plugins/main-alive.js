
const { cmd } = require('../command');
const os = require("os");
const fs = require("fs");
const moment = require("moment-timezone");
const { runtime } = require('../lib/functions');
const config = require('../config');

cmd({
    pattern: "alive",
    alias: ["mega", "live"],
    desc: "Check bot is alive or not",
    category: "main",
    react: ["🤍", "🌟", "🗿", "🥋", "💫", "☠", "🤍"][Math.floor(Math.random() * 7)],
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const time = moment().tz("America/Port-au-Prince").format("HH:mm:ss");
        const date = moment().tz("America/Port-au-Prince").format("DD/MM/YYYY");

        const imagePath = './DybyTech/alive.jpg';
        if (!fs.existsSync(imagePath)) return reply("❌ Image 'alive.jpg' introuvable dans /DybyTech.");
        const imageBuffer = fs.readFileSync(imagePath);

        const caption = 
`╭──────〔 *ALIVE STATUS* 〕─◉
│ *Online & Running!*
│👤 *Dev: ᴅʏʙʏ ᴛᴇᴄʜ*
│📦 *Version:* 1.0.0
│📍 *Prefix:* [${config.PREFIX}]
│📡 *Mode:* [${config.MODE}]
│🖥️ *Host:* ${os.hostname()}
│🕐 *Uptime:* ${runtime(process.uptime())}
│📅 *Date:* ${date}
│⏰ *Time:* ${time}
╰────────────────────◉
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
                    body: "ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ",
                    mediaType: 1,
                    previewType: "PHOTO",
                    thumbnailUrl: null, // Important: Ne pas utiliser `thumbnail` avec image directe
                    sourceUrl: "https://wa.me/" + config.OWNER_NUMBER
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("❌ Alive Error:", e);
        reply(`❌ Une erreur est survenue : ${e.message}`);
    }
});
