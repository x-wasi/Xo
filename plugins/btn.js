const { cmd } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;
const { getBuffer } = require('../lib/functions'); // Make sure you have a helper to get image buffer (or use axios)

cmd({
    pattern: "btn",
    alias: ["listbutton", "selbtn"],
    desc: "Send a select (list) button",
    react: "🎴",
    category: "main",
    filename: __filename
}, async (conn, m, msg, { from, reply }) => {
    try {
        const image = await getBuffer("https://files.catbox.moe/x13xdq.jpg"); // Download image buffer

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

        await conn.sendMessage(from, {
            image: image,
            caption: listMessage.text,
            footer: listMessage.footer,
            title: listMessage.title,
            buttonText: listMessage.buttonText,
            sections: listMessage.sections
        }, { quoted: m });
    } catch (err) {
        console.error("Select Button Error:", err);
        reply("❌ Failed to send the select menu with image.");
    }
});
