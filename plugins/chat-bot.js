const axios = require("axios");
const { cmd } = require("../command");
const config = require("../config");
const { setConfig, getConfig } = require("../lib/configdb");

// Default AI State
let AI_STATE = {
    IB: "false", // Inbox / Private chats
    GC: "false", // Group chats
};

// Toggle AI Chatbot
cmd({
    pattern: "chatbot",
    alias: ["aichat", "dyby", "megabot"],
    desc: "Enable or disable AI chatbot",
    category: "settings",
    filename: __filename,
    react: "🤖"
}, async (conn, mek, m, { args, isOwner, reply }) => {
    if (!isOwner) return reply("*❌ Only the bot owner can use this command.*");

    const mode = args[0]?.toLowerCase();
    const target = args[1]?.toLowerCase();

    if (mode === "on") {
        if (!target || target === "all") {
            AI_STATE.IB = "true";
            AI_STATE.GC = "true";
        } else if (target === "ib") {
            AI_STATE.IB = "true";
        } else if (target === "gc") {
            AI_STATE.GC = "true";
        }
    } else if (mode === "off") {
        if (!target || target === "all") {
            AI_STATE.IB = "false";
            AI_STATE.GC = "false";
        } else if (target === "ib") {
            AI_STATE.IB = "false";
        } else if (target === "gc") {
            AI_STATE.GC = "false";
        }
    } else {
        return reply(`*🤖 DYBYTECH Chatbot Menu*

✅ *Enable AI Chatbot*
> .chatbot on all - Enable in all chats  
> .chatbot on ib - Enable in inbox only  
> .chatbot on gc - Enable in groups only

❌ *Disable AI Chatbot*
> .chatbot off all - Disable in all chats  
> .chatbot off ib - Disable in inbox only  
> .chatbot off gc - Disable in groups only`);
    }

    await setConfig("AI_STATE", JSON.stringify(AI_STATE));
    reply(`✅ AI Chatbot settings updated:\nInbox: ${AI_STATE.IB} | Group: ${AI_STATE.GC}`);
});

// Load AI state at startup
(async () => {
    const saved = await getConfig("AI_STATE");
    if (saved) AI_STATE = JSON.parse(saved);
})();

// Auto AI response when user replies to the bot
cmd({
    on: "body",
}, async (conn, m, store, { from, body, isGroup, reply }) => {
    try {
        const context = m?.message?.extendedTextMessage?.contextInfo;
        const repliedTo = context?.participant;
        const botJid = conn.user.id.split(":")[0] + "@s.whatsapp.net";

        // Only respond if the message is a reply to the bot
        if (!repliedTo || repliedTo !== botJid) return;

        // Check if AI is enabled for this chat type
        const isInbox = !isGroup;
        if ((isInbox && AI_STATE.IB !== "true") || (isGroup && AI_STATE.GC !== "true")) return;

        // Ignore commands and empty messages
        if (!body || m.key.fromMe || body.startsWith(config.PREFIX)) return;

        // Call the free AI API
        const apiUrl = `https://aiv1.yasir-bot.repl.co/api/openai?q=${encodeURIComponent(body)}`;
        const { data } = await axios.get(apiUrl);

        if (data && data.status && data.result) {
            await conn.sendMessage(from, {
                text: data.result + "\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ ⚡"
            }, { quoted: m });
        } else {
            reply("⚠️ AI failed to generate a response.");
        }

    } catch (err) {
        console.error("AI Chatbot Error:", err);
        reply("❌ An error occurred while contacting the AI.");
    }
});
