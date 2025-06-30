/*const axios = require('axios');
const { cmd, commands } = require('../command');
const config = require("../config");
const { setConfig, getConfig } = require("../lib/configdb");

// Default AI settings if not set
let AI_ENABLED = "false"; // Default disabled
let AI_MODE = "all"; // Default mode: respond everywhere

cmd({
    pattern: "aichat",
    alias: ["chatbot", "subzerobot"],
    desc: "Enable or disable AI chatbot responses",
    category: "settings",
    filename: __filename,
    react: "✅"
}, async (conn, mek, m, { from, args, isOwner, reply }) => {
    if (!isOwner) return reply("*📛 Only the owner can use this command!*");

    const status = args[0]?.toLowerCase();
    const mode = args[1]?.toLowerCase();
    
    // Handle enable/disable
    if (status === "on") {
        AI_ENABLED = "true";
        await setConfig("AI_ENABLED", "true");
        
        // Set mode if provided
        if (mode && ["groups", "inbox", "all"].includes(mode)) {
            AI_MODE = mode;
            await setConfig("AI_MODE", mode);
            return reply(`🤖 AI chatbot is now enabled in ${mode === "all" ? "all chats" : mode === "groups" ? "groups only" : "inbox only"}`);
        }
        
        return reply("🤖 AI chatbot is now enabled everywhere");
    } else if (status === "off") {
        AI_ENABLED = "false";
        await setConfig("AI_ENABLED", "false");
        return reply("🤖 AI chatbot is now disabled");
    } else if (["groups", "inbox", "all"].includes(status)) {
        // Just change mode without changing enabled state
        AI_MODE = status;
        await setConfig("AI_MODE", status);
        return reply(`🤖 AI mode set to ${status === "all" ? "all chats" : status === "groups" ? "groups only" : "inbox only"}`);
    } else {
        return reply(
            `Current AI state: ${AI_ENABLED === "true" ? "ON" : "OFF"}\n` +
            `Current mode: ${AI_MODE === "all" ? "All chats" : AI_MODE === "groups" ? "Groups only" : "Inbox only"}\n\n` +
            `Usage:\n` +
            `${prefix}aichat on [mode] - Enable AI (mode: groups/inbox/all)\n` +
            `${prefix}aichat off - Disable AI\n` +
            `${prefix}aichat [mode] - Change mode without toggling`
        );
    }
});

// Initialize AI settings on startup
(async () => {
    const savedState = await getConfig("AI_ENABLED");
    const savedMode = await getConfig("AI_MODE");
    if (savedState) AI_ENABLED = savedState;
    if (savedMode) AI_MODE = savedMode;
})();

// AI Chatbot - Subzero MD by Darrell Mucheri
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

        // Check mode restrictions
        if ((AI_MODE === "groups" && !isGroup) return; // Only respond in groups
        if ((AI_MODE === "inbox" && isGroup)) return; // Only respond in private chats

        // Optional: Prevent bot responding to its own messages or commands
        if (!body || m.key.fromMe || body.startsWith(config.PREFIX)) return;

        // Encode message for the query
        const query = encodeURIComponent(body);
        const prompt = encodeURIComponent("you are subzero md whatsapp bot made by mr frank ofc ( darrell mucheri ). a tech genius in zimbabwe. act smart and enigmatic about personal stuff about him. He is 17 years (2025).Every mesaage you reply put footer \n> �ᴘᴏᴡᴇʀᴇᴅ ʙʏ �ᴍʀ ғʀᴀɴᴋ 🤖");

        // BK9 API Request
        const apiUrl = `https://bk9.fun/ai/BK93?BK9=${prompt}&q=${query}`;

        const { data } = await axios.get(apiUrl);

        if (data && data.status && data.BK9) {
            await conn.sendMessage(from, {
                text: data.BK9
            }, { quoted: m });
        } else {
            reply("⚠️ Subzero AI failed to generate a response.");
        }

    } catch (err) {
        console.error("AI Chatbot Error:", err.message);
        reply("❌ An error occurred while contacting the AI.");
    }
});

*/
const axios = require('axios');
const { cmd, commands } = require('../command');
const config = require("../config");
const { setConfig, getConfig } = require("../lib/configdb");

// Default AI state if not set
let AI_ENABLED = "false"; // Default enabled

cmd({
    pattern: "aichat",
    alias: ["chatbot", "subzerobot"],
    desc: "Enable or disable AI chatbot responses",
    category: "settings",
    filename: __filename,
    react: "✅"
}, async (conn, mek, m, { from, args, isOwner, reply }) => {
    if (!isOwner) return reply("*📛 Only the owner can use this command!*");

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        AI_ENABLED = "true";
        await setConfig("AI_ENABLED", "true");
        return reply("🤖 AI chatbot is now enabled");
    } else if (status === "off") {
        AI_ENABLED = "false";
        await setConfig("AI_ENABLED", "false");
        return reply("🤖 AI chatbot is now disabled");
    } else {
        return reply(`Current AI state: ${AI_ENABLED === "true" ? "ON" : "OFF"}\nUsage: ${prefix}aichat on/off`);
    }
});

// Initialize AI state on startup
(async () => {
    const savedState = await getConfig("AI_ENABLED");
    if (savedState) AI_ENABLED = savedState;
})();

// AI Chatbot - Subzero MD by Darrell Mucheri
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
        const prompt = encodeURIComponent("you are subzero md whatsapp bot made by mr frank ofc ( darrell mucheri ). a tech genius in zimbabwe. act smart and enigmatic about personal stuff about him. He is 17 years (2025).Every mesaage you reply put footer \n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ғʀᴀɴᴋ 🤖");

        // BK9 API Request
        const apiUrl = `https://bk9.fun/ai/BK93?BK9=${prompt}&q=${query}`;

        const { data } = await axios.get(apiUrl);

        if (data && data.status && data.BK9) {
            await conn.sendMessage(from, {
                text: data.BK9
            }, { quoted: m });
        } else {
            reply("⚠️ Subzero AI failed to generate a response.");
        }

    } catch (err) {
        console.error("AI Chatbot Error:", err.message);
        reply("❌ An error occurred while contacting the AI.");
    }
});




// USE LESS
/*const axios = require('axios');
const { cmd } = require('../command');
const config = require("../config");

// AI Chatbot - Kaizenji GPT4o-mini
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
    // Prevent bot from responding to itself or commands
    if (!body || body.startsWith("!") || m.key.fromMe) return;

    // Optional: Only respond in private chats
    // if (isGroup) return;

    const apiUrl = `https://kaiz-apis.gleeze.com/api/gpt4o-mini?ask=${encodeURIComponent(body)}&apikey=cf2ca612-296f-45ba-abbc-473f18f991eb`;

    const { data } = await axios.get(apiUrl);

    if (data && data.response) {
      await conn.sendMessage(from, {
        text: data.response
      }, { quoted: m });
    } else {
      reply("⚠️ No response from AI.");
    }

  } catch (err) {
    console.error("AI Chatbot Error:", err.message);
    reply("❌ Failed to get a response from AI.");
  }
});


const axios = require('axios');
const { cmd } = require('../command');
const config = require("../config");

// AI Chatbot - Subzero MD by Darrell Mucheri
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
    // Optional: Prevent bot responding to its own messages or commands
    if (!body || m.key.fromMe || body.startsWith("!")) return;

    // Encode message for the query
    const query = encodeURIComponent(body);
    const prompt = encodeURIComponent("you are subzero md whatsapp bot made by mr frank ofc ( darrell mucheri ). a tech genius in zimbabwe. act smart and enigmatic about personal stuff about him. He is 17 years (2025).Every mesaage you reply put footer \n> Powered By Mr Frank");

    // BK9 API Request
    const apiUrl = `https://bk9.fun/ai/BK93?BK9=${prompt}&q=${query}`;

    const { data } = await axios.get(apiUrl);

    if (data && data.status && data.BK9) {
      await conn.sendMessage(from, {
        text: data.BK9
      }, { quoted: m });
    } else {
      reply("⚠️ Subzero AI failed to generate a response.");
    }

  } catch (err) {
    console.error("AI Chatbot Error:", err.message);
    reply("❌ An error occurred while contacting the AI.");
  }
});

*/
