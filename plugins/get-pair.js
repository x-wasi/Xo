
const fetch = require("node-fetch");
const { cmd } = require("../command");

cmd({
    pattern: "pair",
    alias: ["getpair", "clonebot"],
    react: "✅",
    desc: "Get WhatsApp pairing code",
    category: "download",
    use: ".pair +1234567890",
    filename: __filename
}, 
async (conn, mek, m, { q, reply }) => {
    try {
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        // Validate input number
        if (!q || !/^\d{8,15}$/.test(q)) {
            return await reply("❌ Invalid phone number. Example: `.pair 50934xxxxx`");
        }

        // Fetch pairing code from API
        const response = await fetch(`https://meg-lodon-session.up.railway.app/code?number=${q}`);
        const pair = await response.json();

        if (!pair || !pair.code) {
            return await reply("❌ Failed to retrieve pairing code. Make sure the number is correct.");
        }

        const pairingCode = pair.code;

        // Send pairing code to user
        await reply(`✅ *PAIRING CODE for ${q}*\n\n🔐 Code: *${pairingCode}*\n\nPlease wait while syncing...`);
        await sleep(2000);
        await reply(`${pairingCode}`);

    } catch (error) {
        console.error("PAIR ERROR:", error.message);
        await reply("❌ An error occurred during the pairing process.");
    }
});
