const axios = require('axios');
const { cmd, commands } = require('../command');
const config = require("../config");
const { setConfig, getConfig } = require("../lib/configdb");

// Enhanced AI configuration
let AI_ENABLED = "false";
let AI_SETTINGS = {
    response_cooldown: 2000, // 2 seconds cooldown between responses
    max_history: 5, // Keep last 5 messages as context
    blacklist: [], // Numbers to ignore
    whitelist: [], // Numbers to always respond to
    owner_only_control: true // Only owner can toggle AI
};

// Initialize AI settings
(async () => {
    const savedState = await getConfig("AI_ENABLED");
    if (savedState) AI_ENABLED = savedState;
    
    // Load additional settings if they exist
    const savedSettings = await getConfig("AI_SETTINGS");
    if (savedSettings) AI_SETTINGS = {...AI_SETTINGS, ...savedSettings};
})();

// Enhanced AI control command
cmd({
    pattern: "aichat",
    alias: ["chatbot", "megalodon", "ai"],
    desc: "Control AI chatbot settings",
    category: "settings",
    filename: __filename,
    react: "🤖"
}, async (conn, mek, m, { from, args, isOwner, reply }) => {
    if (AI_SETTINGS.owner_only_control && !isOwner) {
        return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");
    }

    const subCommand = args[0]?.toLowerCase();
    const value = args[1]?.toLowerCase();

    switch(subCommand) {
        case "on":
            AI_ENABLED = "true";
            await setConfig("AI_ENABLED", "true");
            return reply("🤖 ᴀɪ ᴄʜᴀᴛʙᴏᴛ ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ");
            
        case "off":
            AI_ENABLED = "false";
            await setConfig("AI_ENABLED", "false");
            return reply("🤖 ᴀɪ ᴄʜᴀᴛʙᴏᴛ ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ");
            
        case "cooldown":
            if (!isOwner) return reply("Owner only setting");
            const cooldown = parseInt(value);
            if (isNaN(cooldown) || cooldown < 500 || cooldown > 60000) {
                return reply("Please set cooldown between 500-60000 ms");
            }
            AI_SETTINGS.response_cooldown = cooldown;
            await setConfig("AI_SETTINGS", AI_SETTINGS);
            return reply(`⏱ Response cooldown set to ${cooldown}ms`);
            
        case "status":
            const status = AI_ENABLED === "true" ? "🟢 ON" : "🔴 OFF";
            return reply(`ℹ️ AI Status: ${status}\n⚡ Cooldown: ${AI_SETTINGS.response_cooldown}ms`);
            
        default:
            const helpText = `
🤖 *AI Chatbot Control Panel*

• *${prefix}aichat on* - Enable AI
• *${prefix}aichat off* - Disable AI
• *${prefix}aichat status* - Check status
${isOwner ? `• *${prefix}aichat cooldown [ms]* - Set response delay` : ""}

Current State: ${AI_ENABLED === "true" ? "🟢 ON" : "🔴 OFF"}
Cooldown: ${AI_SETTINGS.response_cooldown}ms
`;
            return reply(helpText);
    }
});

// Last response timestamps to manage cooldown
const lastResponses = new Map();

// Enhanced AI Chatbot
cmd({
    on: "text" // More specific than "body" to avoid media messages
}, async (conn, m, store, {
    from,
    body,
    sender,
    isGroup,
    isBotAdmins,
    isAdmins,
    reply,
    isCmd
}) => {
    try {
        // Check if AI is disabled
        if (AI_ENABLED !== "true") return;

        // Prevent bot responding to itself, commands, or empty messages
        if (!body || m.key.fromMe || isCmd) return;

        // Check cooldown
        const now = Date.now();
        const lastResponseTime = lastResponses.get(from) || 0;
        if (now - lastResponseTime < AI_SETTINGS.response_cooldown) {
            return;
        }
        lastResponses.set(from, now);

        // Check blacklist/whitelist
        if (AI_SETTINGS.blacklist.includes(sender)) return;
        if (AI_SETTINGS.whitelist.length > 0 && !AI_SETTINGS.whitelist.includes(sender)) return;

        // Enhanced prompt with context awareness
        const contextPrompt = `
You are dybyTech, an advanced WhatsApp AI assistant created by HansTz. Follow these guidelines:

1. **Personality**: Friendly, helpful, and slightly humorous
2. **Knowledge Cutoff**: Current until July 2025
3. **Response Style**: Concise (1-3 sentences) unless more is needed
4. **Special Cases**:
   - If asked about HansTz, share his portfolio: https://contacte-dyby-tech.vercel.app/
   - For tech questions, provide detailed answers
   - If insulted, respond wittily but don't escalate
5. **Current Context**: ${body}

Previous conversation context (if any):
${store.getConversationHistory(from, AI_SETTINGS.max_history)}

Response guidelines:
- Use markdown for *emphasis*
- Include relevant links when helpful
- End with "⚡ Powered by dybyTech"
`;

        const query = encodeURIComponent(body);
        const prompt = encodeURIComponent(contextPrompt);

        // Enhanced API request with timeout and better error handling
        const apiUrl = `https://bk9.fun/ai/BK93?BK9=${prompt}&q=${query}`;
        
        const { data } = await axios.get(apiUrl, {
            timeout: 10000 // 10 second timeout
        });

        if (data?.BK9) {
            // Add to conversation history before sending
            store.addToConversationHistory(from, {
                user: body,
                bot: data.BK9
            });
            
            // Send with typing indicator
            await conn.sendPresenceUpdate('composing', from);
            setTimeout(async () => {
                await conn.sendMessage(from, {
                    text: data.BK9 + "\n\n⚡ Powered by dybyTech",
                    mentions: m.message.extendedTextMessage?.contextInfo?.mentionedJid || []
                }, { quoted: m });
            }, 1500); // Simulate typing delay
        } else {
            reply("🤖 I'm having trouble thinking right now. Try again later!");
        }

    } catch (err) {
        console.error("AI Error:", err);
        if (!err.response) {
            reply("🌐 Network error - can't connect to AI service");
        } else {
            reply("⚠️ AI encountered an error: " + err.message);
        }
    }
});

// Utility functions for conversation history
class ConversationStore {
    constructor() {
        this.history = new Map();
    }

    addToConversationHistory(chatId, {user, bot}) {
        if (!this.history.has(chatId)) {
            this.history.set(chatId, []);
        }
        const chatHistory = this.history.get(chatId);
        chatHistory.push({user, bot});
        
        // Keep only the most recent messages
        if (chatHistory.length > AI_SETTINGS.max_history) {
            this.history.set(chatId, chatHistory.slice(-AI_SETTINGS.max_history));
        }
    }

    getConversationHistory(chatId, maxItems = AI_SETTINGS.max_history) {
        if (!this.history.has(chatId)) return "";
        return this.history.get(chatId)
            .slice(-maxItems)
            .map(entry => `User: ${entry.user}\nBot: ${entry.bot}`)
            .join("\n\n");
    }
}

// Initialize conversation store
const store = new ConversationStore();
