const { cmd } = require('../command');
const prefix = config.PREFIX; 
cmd({
    pattern: "selectbutton",
    alias: ["listbutton", "selbtn"],
    desc: "Send a select (list) button",
    category: "dev",
    filename: __filename
}, async (conn, m, msg, { from, reply }) => {
    try {
        const sections = [
            {
                title: "📌 Main Options",
                rows: [
                    {
                        title: "👤 View Profile",
                        rowId: "view_profile"
                    },
                    {
                        title: "⚙️ Settings",
                        rowId: "settings"
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
                        title: "ALL MENU",
                        rowId: "${prefix}menu"
                    }
                ]
            }
        ];

        const listMessage = {
            text: "👋 *Welcome to the interactive menu*",
            footer: "📍 Select an option below",
            title: "✨ MEGALODON-MD Menu",
            buttonText: "📋 Open Menu",
            sections
        };

        await conn.sendMessage(from, listMessage, { quoted: m });
    } catch (err) {
        console.error("Select Button Error:", err);
        reply("❌ Failed to send the select menu.");
    }
});
