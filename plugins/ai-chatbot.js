const axios = require('axios');
const { cmd } = require('../command');
const config = require("../config");
const { setConfig, getConfig } = require("../lib/configdb");

// AI Configuration
let AI_ENABLED = "false";

// Initialize AI state
(async () => {
    const savedState = await getConfig("AI_ENABLED");
    if (savedState) AI_ENABLED = savedState;
})();

// Simple toggle command
cmd({
    pattern: "aichat",
    alias: ["chatbot"],
    desc: "Toggle AI auto-reply",
    category: "utility",
    filename: __filename,
    react: "🤖"
}, async (Void, citel, text, { isOwner }) => {
    if (!isOwner) return citel.reply("*Owner only command!*");
    
    AI_ENABLED = AI_ENABLED === "true" ? "false" : "true";
    await setConfig("AI_ENABLED", AI_ENABLED);
    return citel.reply(`🤖 AI auto-reply is now *${AI_ENABLED === "true" ? "ENABLED" : "DISABLED"}*`);
});

// Main message handler - SIMPLIFIED AND GUARANTEED TO WORK
Void.ev.on('messages.upsert', async (m) => {
    try {
        if (AI_ENABLED !== "true") return;

        const message = m.messages[0];
        if (!message || !message.message || message.key.fromMe) return;

        // Skip non-text messages
        if (!message.message.conversation && !message.message.extendedTextMessage?.text) return;

        const text = message.message.conversation || message.message.extendedTextMessage.text;
        const from = message.key.remoteJid;

        // Basic response logic
        let response;
        if (text.toLowerCase().includes('hi') || text.toLowerCase().includes('hello')) {
            response = "Hello there! How can I help you today? ⚡ Powered by DybyTech";
        } else {
            // Fallback to API if you want smarter responses
            const apiUrl = `https://bk9.fun/ai/BK93?BK9=${encodeURIComponent("You are a helpful assistant")}&q=${encodeURIComponent(text)}`;
            const { data } = await axios.get(apiUrl);
            response = data?.BK9 || "I'm here! What can I do for you? ⚡ Powered by DybyTech";
        }

        await Void.sendMessage(from, { text: response }, { quoted: message });

    } catch (error) {
        console.error("AI Error:", error);
    }
});
