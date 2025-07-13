const { cmd } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;
const axios = require('axios');

async function getBuffer(url) {
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(res.data, 'utf-8');
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

cmd({
    pattern: "btn",
    alias: ["imgbtn", "templatebtn"],
    desc: "Send image, wait, then send interactive buttons",
    react: "🖼️",
    category: "main",
    filename: __filename
}, async (conn, m, msg, { from, reply }) => {
    try {
        // 1. Get image buffer
        const imageBuffer = await getBuffer("https://files.catbox.moe/x13xdq.jpg");

        // 2. Send image first
        await conn.sendMessage(from, {
            image: imageBuffer,
            caption: "🦈 *MEGALODON-MD*\n\nHere is your image preview!"
        }, { quoted: m });

        // 3. Wait for 2 seconds
        await delay(2000);

        // 4. Send message with template buttons
        await conn.sendMessage(from, {
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
        }, { quoted: m });

    } catch (err) {
        console.error("❌ Error sending image or buttons:", err);
        reply("❌ Failed to send image or buttons.");
    }
});
