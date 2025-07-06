const axios = require('axios');
const { cmd, commands } = require('../command');
const config = require("../config");
const { setConfig, getConfig } = require("../lib/configdb");

// Default AI state if not set
let AI_ENABLED = "false"; // Default enabled

cmd({
    pattern: "aichat",
    alias: ["chatbot", "megalodon"],
    desc: "Enable or disable AI chatbot responses",
    category: "ai",
    filename: __filename,
    react: "✅"
}, async (conn, mek, m, { from, args, isOwner, reply }) => {
    if (!isOwner) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        AI_ENABLED = "true";
        await setConfig("AI_ENABLED", "true");
        return reply("🤖 ᴀɪ ᴄʜᴀᴛʙᴏᴛ ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ");
    } else if (status === "off") {
        AI_ENABLED = "false";
        await setConfig("AI_ENABLED", "false");
        return reply("🤖 ᴀɪ ᴄʜᴀᴛʙᴏᴛ ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ");
    } else {
        return reply(`ᴄᴜʀʀᴇɴᴛ ᴀɪ sᴛᴀᴛᴇ: ${AI_ENABLED === "true" ? "ON" : "OFF"}\nUsage: ${prefix}ᴀɪᴄʜᴀᴛ ᴏɴ/ᴏғғ`);
    }
});

// Initialize AI state on startup
(async () => {
    const savedState = await getConfig("AI_ENABLED");
    if (savedState) AI_ENABLED = savedState;
})();

// AI Chatbot - DybyTech 
cmd({
    on: "body"
}, async (conn, m, store, {
    from,
    body,
    sender,
    isGroup,
    isBotAdmins,
    isAdmins,
    reply
}) => {
    try {
        // Check if AI is disabled
        if (AI_ENABLED !== "true") return;

        // Optional: Prevent bot responding to its own messages or commands
        if (!body || m.key.fromMe || body.startsWith(config.PREFIX)) return;

        // Encode message for the query
        const query = encodeURIComponent(body);
        const prompt = encodeURIComponent("you are Megalodon md whatsapp bot made by DybyTech. Need DybyTech ? \n\nhttps://contacte-dyby-tech.vercel.app/ \n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ 🤖");

        // BK9 API Request
        const apiUrl = `https://bk9.fun/ai/BK93?BK9=${prompt}&q=${query}`;

        const { data } = await axios.get(apiUrl);

        if (data && data.status && data.BK9) {
            await conn.sendMessage(from, {
                text: data.BK9
            }, { quoted: m });
        } else {
            reply("⚠️ Megalodon AI failed to generate a response.");
        }

    } catch (err) {
        console.error("AI Chatbot Error:", err.message);
        reply("❌ An error occurred while contacting the AI.");
    }
});
