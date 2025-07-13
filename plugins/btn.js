const { cmd } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;
const axios = require('axios');

async function getBuffer(url) {
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(res.data, 'utf-8');
}

cmd({
    pattern: "btn",
    alias: ["imgbtn", "templatebtn"],
    desc: "Send image with interactive buttons",
    react: "🎴",
    category: "main",
    filename: __filename
}, async (conn, m, msg, { from, reply }) => {
    try {
        const imageBuffer = await getBuffer("https://files.catbox.moe/x13xdq.jpg");

        const templateMessage = {
            templateMessage: {
                hydratedTemplate: {
                    imageMessage: { jpegThumbnail: imageBuffer }, // Thumbnail (small image)
                    hydratedContentText: "👋 *Welcome to MEGALODON-MD!*\n\n📍 Choose an option below:",
                    hydratedFooterText: "🦈 Powered by DybyTech",
                    hydratedButtons: [
                        {
                            quickReplyButton: {
                                displayText: "📜 All Menu",
                                id: `${prefix}menu`
                            }
                        },
                        {
                            quickReplyButton: {
                                displayText: "👤 Alive",
                                id: `${prefix}alive`
                            }
                        },
                        {
                            urlButton: {
                                displayText: "🌐 Website",
                                url: "https://example.com"
                            }
                        }
                    ]
                }
            }
        };

        await conn.sendMessage(from, templateMessage, { quoted: m });

    } catch (err) {
        console.error("❌ Template Button Error:", err);
        reply("❌ Failed to send image with buttons.");
    }
});
