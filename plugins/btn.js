const { cmd } = require('../command');
const axios = require('axios');

async function getBuffer(url) {
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(res.data, 'utf-8');
}

cmd({
    pattern: "btn",
    alias: ["ibtn", "btnsample"],
    desc: "Send a sample interactive button message with image",
    react: "🎴",
    category: "dev",
    filename: __filename
}, async (conn, m, msg, { reply, from }) => {
    try {
        const image = await getBuffer("https://files.catbox.moe/x13xdq.jpg");

        const message = {
            image: image,
            caption: "👋 *Hello World!*\nChoose an option below.",
            footer: "📌 This is the Footer",
            templateButtons: [
                {
                    index: 1,
                    quickReplyButton: {
                        displayText: "💬 Quick Reply",
                        id: "quick_reply_id"
                    }
                },
                {
                    index: 2,
                    urlButton: {
                        displayText: "🌐 Tap Here!",
                        url: "https://www.example.com/"
                    }
                },
                {
                    index: 3,
                    quickReplyButton: {
                        displayText: "📋 Copy Code",
                        id: "copy_code_id"
                    }
                }
            ]
        };

        await conn.sendMessage(from, message, { quoted: m });
    } catch (err) {
        console.error("❌ Button Test Error:", err);
        reply("❌ Failed to send image with buttons.");
    }
});
