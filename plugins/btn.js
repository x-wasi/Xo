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
    desc: "Send image then buttons",
    react: "🖼️",
    category: "main",
    filename: __filename
}, async (conn, m, msg, { from, reply }) => {
    try {
        // 1. Send image first
        const imageBuffer = await getBuffer("https://files.catbox.moe/x13xdq.jpg");

        await conn.sendMessage(from, {
            image: imageBuffer,
            caption: "🦈 *MEGALODON-MD*\n\nHere is your image preview!"
        }, { quoted: m });

        // 2. Send buttons separately
        const buttonMessage = {
            text: "👋 *Welcome to MEGALODON-MD!*",
            footer: "📍 Select an option below",
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

        await conn.sendMessage(from, buttonMessage, { quoted: m });

    } catch (err) {
        console.error("❌ Button/Image Error:", err);
        reply("❌ Failed to send image and buttons.");
    }
});
