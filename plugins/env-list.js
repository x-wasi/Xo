const config = require('../config');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
const axios = require('axios');

function isEnabled(value) {
    // Function to check if a value represents a "true" boolean state
    return value && value.toString().toLowerCase() === "true";
}

cmd({
    pattern: "config",
    alias: ["variables", "env"],
    desc: "Settings of bot",
    category: "menu",
    react: "🦋",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, reply }) => {
    try {
        // Define the settings message with the correct boolean checks
        let envSettings = `╭━━━〔 *𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃* 〕━━━┈⊷
┃▸╭───────────
┃▸┃๏ *𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃 𝐒𝐄𝐓𝐓𝐈𝐍𝐆𝐒 ❄️*
┃▸└───────────···๏
╰────────────────┈⊷
╭━━〔 *ᴇɴᴀʙʟᴇᴅ ᴅɪsᴀʙʟᴇᴅ* 〕━━┈⊷
┇๏ *ᴀᴜᴛᴏ ʀᴇᴀᴅ sᴛᴀᴛᴜs:* ${isEnabled(config.AUTO_STATUS_SEEN) ? "Enabled ✅" : "Disabled ❌"}
┇๏ *ᴀᴜᴛᴏ ʀᴇᴘʟʏ sᴛᴀᴛᴜs:* ${isEnabled(config.AUTO_STATUS_REPLY) ? "Enabled ✅" : "Disabled ❌"}
┇๏ *ᴄᴜsᴛᴏᴍ ʀᴇᴀᴄᴛs:* ${isEnabled(config.CUSTOM_REACT) ? "Enabled ✅" : "Disabled ❌"}
┇๏ *ᴀᴜᴛᴏ ʀᴇᴀᴄᴛ:* ${isEnabled(config.AUTO_REACT) ? "Enabled ✅" : "Disabled ❌"}
┇๏ *ᴅᴇʟᴇᴛᴇ ʟɪɴᴋs:* ${isEnabled(config.DELETE_LINKS) ? "Enabled ✅" : "Disabled ❌"}
┇๏ *ᴀɴᴛɪ-ʟɪɴᴋ:* ${isEnabled(config.ANTI_LINK) ? "Enabled ✅" : "Disabled ❌"}
┇๏ *ᴀɴᴛɪ-ʙᴀᴅ ᴡᴏʀᴅs:* ${isEnabled(config.ANTI_BAD) ? "Enabled ✅" : "Disabled ❌"}
┇๏ *ᴀᴜᴛᴏ ᴛʏᴘɪɴɢ:* ${isEnabled(config.AUTO_TYPING) ? "Enabled ✅" : "Disabled ❌"}
┇๏ *ᴀᴜᴛᴏ ʀᴇᴄᴏʀᴅɪɴɢ:* ${isEnabled(config.AUTO_RECORDING) ? "Enabled ✅" : "Disabled ❌"}
┇๏ *ᴀʟᴡᴀʏs ᴏɴʟɪɴᴇ:* ${isEnabled(config.ALWAYS_ONLINE) ? "Enabled ✅" : "Disabled ❌"}
┇๏ *ᴘᴜʙʟɪᴄ ᴍᴏᴅᴇ:* ${isEnabled(config.PUBLIC_MODE) ? "Enabled ✅" : "Disabled ❌"}
┇๏ *ʀᴇᴀᴅ ᴍᴇssᴀɢᴇ:* ${isEnabled(config.READ_MESSAGE) ? "Enabled ✅" : "Disabled ❌"}
╰━━━━━━━━━━━━──┈⊷
> 𝐒𝐔𝐁𝐙𝐄𝐑𝐎 𝐁𝐎𝐓`;

        // Send message with an image
        await conn.sendMessage(
            from,
            {
                image: { url: 'https://files.catbox.moe/phamfv.jpg' }, // Image URL
                caption: envSettings,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401051937059@newsletter',
                        newsletterName: "『 𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍 𝐌𝐃 』",
                        serverMessageId: 143
                    }
                }
            },
            { quoted: mek }
        );

    } catch (error) {
        console.log(error);
        reply(`Error: ${error.message}`);
    }
});
