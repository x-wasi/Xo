const axios = require('axios');
const { cmd, commands } = require('../command');
const config = require("../config");
const { setConfig, getConfig } = require("../lib/configdb");

// AI Configuration
let AI_ENABLED = "false";
let AI_SETTINGS = {
    response_cooldown: 2000,
    max_history: 3,
    blacklist: [],
    whitelist: []
};

// Initialize AI settings
(async () => {
    const savedState = await getConfig("AI_ENABLED");
    if (savedState) AI_ENABLED = savedState;
    
    const savedSettings = await getConfig("AI_SETTINGS");
    if (savedSettings) AI_SETTINGS = {...AI_SETTINGS, ...savedSettings};
})();

// AI Control Command
cmd({
    pattern: "aichat",
    alias: ["chatbot", "ai"],
    desc: "Enable/disable AI auto-reply",
    category: "settings",
    filename: __filename,
    react: "🤖"
}, async (conn, mek, m, { from, args, isOwner, reply }) => {
    if (!isOwner) return reply("*📛 Owner only command!*");

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        AI_ENABLED = "true";
        await setConfig("AI_ENABLED", "true");
        return reply("🤖 AI auto-reply is now *ENABLED*");
    } else if (status === "off") {
        AI_ENABLED = "false";
        await setConfig("AI_ENABLED", "false");
        return reply("🤖 AI auto-reply is now *DISABLED*");
    } else {
        return reply(`Current AI status: ${AI_ENABLED === "true" ? "🟢 ON" : "🔴 OFF"}\nUsage: ${prefix}aichat on/off`);
    }
});

// Response cooldown tracker
const lastResponses = new Map();

// Main AI Message Handler
cmd({
    on: "text"
}, async (conn, m, store, {
    from,
    body,
    sender,
    isGroup,
    isBotAdmins,
    isAdmins,
    reply,
    isCmd,
    isMedia,
    isSticker,
    isReaction,
    isNewsletter,
    isChannel
}) => {
    try {
        // Skip if AI is disabled
        if (AI_ENABLED !== "true") return;

        // Skip non-text messages and commands
        if (!body || m.key.fromMe || isCmd || isMedia || isSticker || isReaction || isNewsletter || isChannel) return;

        // Check cooldown
        const now = Date.now();
        const lastResponseTime = lastResponses.get(sender) || 0;
        if (now - lastResponseTime < AI_SETTINGS.response_cooldown) return;
        lastResponses.set(sender, now);

        // Skip blacklisted users
        if (AI_SETTINGS.blacklist.includes(sender)) return;

        // Prepare prompt
        const prompt = `
You are Megalodon-Xmd, a friendly WhatsApp AI assistant created by HansTz. 
Respond naturally to the user's message. Be helpful and concise.

User's message: "${body}"

Guidelines:
1. Keep responses under 2 sentences unless more is needed
2. Be polite and friendly
3. For personal questions about HansTz, direct them to his portfolio
4. End with "⚡ Powered by Megalodon-Xmd"
`;

        const query = encodeURIComponent(body);
        const encodedPrompt = encodeURIComponent(prompt);

        // Call AI API
        const hansUrl = `https://bk9.fun/ai/BK93?BK9=${encodedPrompt}&q=${query}`;
        const { data } = await axios.get(hansUrl, { timeout: 8000 });

        if (data?.BK9) {
            // Simulate typing before replying
            await conn.sendPresenceUpdate('composing', from);
            
            setTimeout(async () => {
                await conn.sendMessage(from, { 
                    text: data.BK9 + "\n\n⚡ Powered by Megalodon-Xmd" 
                }, { quoted: m });
            }, 1500);
        } else {
            reply("🤖 Sorry, I couldn't process that request.");
        }

    } catch (err) {
        console.error("AI Error:", err);
        // Don't reply on error to avoid spam
    }
});

// Conversation history store (simplified)
class ConversationStore {
    constructor() {
        this.history = new Map();
    }
    
    addToConversationHistory(chatId, message) {
        if (!this.history.has(chatId)) {
            this.history.set(chatId, []);
        }
        this.history.get(chatId).push(message);
    }
}

const store = new ConversationStore();
