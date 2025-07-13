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
    alias: ["listbutton", "selbtn"],
    desc: "Send a select (list) button",
    react: "🎴",
    category: "main",
    filename: __filename
}, async (conn, m, msg, { from, reply }) => {
    try {
        const image = await getBuffer("https://files.catbox.moe/x13xdq.jpg");

        // Send image first (optional)
        await conn.sendMessage(from, {
            image,
            caption: "✨ ᴍᴇɢᴀʟᴏᴅᴏɴ-ᴍᴅ - ᴍᴀɪɴ ᴍᴇɴᴜ",
        }, { quoted: m });

        // Now send the list message separately
        const sections = [
            {
                title: "📌 Main Options",
                rows: [
                    {
                        title: "👤 ALIVE",
                        rowId: `${prefix}Alive`
                    },
                    {
                        title: "⚙️ Settings",
                        rowId: `${prefix}Env`
                    }
                ]
            },
            {
                title: "🔧 Advanced Tools",
                rows: [
                    {
                        title: "📊 Stats",
                        rowId: "statistics"
                    },
                    {
                        title: "📜 All Menu",
                        rowId: `${prefix}Menu`
                    }
                ]
            }
        ];

        const listMessage = {
            text: "👋 *ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ᴛʜᴇ ɪɴᴛᴇʀᴀᴄᴛɪᴠᴇ ᴍᴇɴᴜ*",
            footer: "📍 sᴇʟᴇᴄᴛ ᴀɴ ᴏᴘᴛɪᴏɴ ʙᴇʟᴏᴡ",
            title: "✨ ᴍᴇɢᴀʟᴏᴅᴏɴ-ᴍᴅ ᴍᴇɴᴜ",
            buttonText: "📋 ӨPΣП MΣПЦ",
            sections
        };

        await conn.sendMessage(from, listMessage, { quoted: m });

    } catch (err) {
        console.error("Select Button Error:", err);
        reply("❌ Failed to send menu.");
    }
});
