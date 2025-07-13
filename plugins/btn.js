

const { cmd } = require('../command');
const config = require('../config');
const prefix = config.PREFIX

cmd({
pattern: "btn",
alias: ["listbutton", "selbtn"],
desc: "Send a select (list) button",
react: "🎴",
category: "main",
filename: __filename
}, async (conn, m, msg, { from, reply }) => {
try {
const sections = [
{
title: "📌 Main Options",
rows: [
{
title: "👤 ALIVE",
rowId: ${prefix}Alive
},
{
title: "⚙️ Settings",
rowId: ${prefix}Env
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
rowId: ${prefix}Menu // ✅ fixed here
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
    reply("❌ Failed to send the select menu.");  
}

});

