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
    react: "🖼️",
    category: "main",
    filename: __filename
}, async (conn, m, msg, { from, reply }) => {
    try {
        const image = await getBuffer("https://files.catbox.moe/x13xdq.jpg");

        const templateMessage = {
            image: image,
            caption: "👋 *Welcome to MEGALODON-MD!*\n\n📍 Select one of the options below.",
            footer: "🦈 Powered by DybyTech",
            templateButtons: [
                {
                    index: 1,
                    quickReplyButton: {
                        displayText: "📜 All Menu",
                        id: `${prefix}menu`
                    }
                },
                {
                    index: 2,
                    quickReplyButton: {
                        displayText: "👤 Alive",
                        id: `${prefix}alive`
                    }
                },
                {
                    index: 3,
                    urlButton: {
                        displayText: "🌐 Website",
                        url: "https://example.com"
                    }
                }
            ]
        };

        await conn.sendMessage(from, templateMessage, { quoted: m });

    } catch (err) {
        console.error("Template Button Error:", err);
        reply("❌ Failed to send image with buttons.");
    }
});
