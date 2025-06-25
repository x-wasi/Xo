const config = require('../config');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
const axios = require('axios');

function isEnabled(value) {
    // Function to check if a value represents a "true" boolean state
    return value && value.toString().toLowerCase() === "true";
}

cmd({
    pattern: "env",
    alias: ["config", "setting"],
    desc: "Show all bot configuration variables (Owner Only)",
    category: "settings",
    react: "⚙️",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, reply, isOwner }) => {
    try {
        // Owner check
        if (!isOwner) {
            return reply("🚫 *ᴏᴡɴᴇʀ ᴏɴʟʏ ᴄᴏᴍᴍᴀɴᴅ!* ʏᴏᴜ'ʀᴇ ɴᴏᴛ ᴀᴜᴛʜᴏʀɪᴢᴇᴅ ᴛᴏ ᴠɪᴇᴡ ʙᴏᴛ ᴄᴏɴғɪɢᴜʀᴀᴛɪᴏɴs.");
        }

        const isEnabled = (value) => value && value.toString().toLowerCase() === "true";

        let envSettings = `
╭───『 *𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃 𝐂𝐎𝐍𝐅𝐈𝐆* 』───❏
│
├─❏ *🤖 𝐁𝐎𝐓 𝐈𝐍𝐅𝐎*
│  ├─∘ *ɴᴀᴍᴇ:* ${config.BOT_NAME}
│  ├─∘ *ᴘʀᴇғɪx:* ${config.PREFIX}
│  ├─∘ *ᴏᴡɴᴇʀ:* ${config.OWNER_NAME}
│  ├─∘ *ɴᴜᴍʙᴇʀ:* ${config.OWNER_NUMBER}
│  └─∘ *ᴍᴏᴅᴇ:* ${config.MODE.toUpperCase()}
│
├─❏ *⚙️ 𝐂𝐎𝐑𝐄 𝐒𝐄𝐓𝐓𝐈𝐍𝐆𝐒*
│  ├─∘ *ᴘᴜʙʟɪᴄ ᴍᴏᴅᴇ:* ${isEnabled(config.PUBLIC_MODE) ? "✅" : "❌"}
│  ├─∘ *Always Online:* ${isEnabled(config.ALWAYS_ONLINE) ? "✅" : "❌"}
│  ├─∘ *ʀᴇᴀᴅ ᴍsɢs:* ${isEnabled(config.READ_MESSAGE) ? "✅" : "❌"}
│  └─∘ *ʀᴇᴀᴅ ᴄᴍᴅs:* ${isEnabled(config.READ_CMD) ? "✅" : "❌"}
│
├─❏ *🔌 𝐀𝐔𝐓𝐎𝐌𝐀𝐓𝐈𝐎𝐍*
│  ├─∘ *ᴀᴜᴛᴏ ʀᴇᴘʟʏ:* ${isEnabled(config.AUTO_REPLY) ? "✅" : "❌"}
│  ├─∘ *ᴀᴜᴛᴏ ʀᴇᴀᴄᴛ:* ${isEnabled(config.AUTO_REACT) ? "✅" : "❌"}
│  ├─∘ *ᴄᴜsᴛᴏᴍ ʀᴇᴀᴄᴛ:* ${isEnabled(config.CUSTOM_REACT) ? "✅" : "❌"}
│  ├─∘ *ʀᴇᴀᴄᴛ ᴇᴍᴏᴊɪs:* ${config.CUSTOM_REACT_EMOJIS}
│  ├─∘ *ᴀᴜᴛᴏ sᴛɪᴄᴋᴇʀ:* ${isEnabled(config.AUTO_STICKER) ? "✅" : "❌"}
│  └─∘ *ᴀᴜᴛᴏ ᴠᴏɪᴄᴇ:* ${isEnabled(config.AUTO_VOICE) ? "✅" : "❌"}
│
├─❏ *📢 𝐒𝐓𝐀𝐓𝐔𝐒 𝐒𝐄𝐓𝐓𝐈𝐍𝐆𝐒*
│  ├─∘ *Status Seen:* ${isEnabled(config.AUTO_STATUS_SEEN) ? "✅" : "❌"}
│  ├─∘ *sᴛᴀᴛᴜs ʀᴇᴘʟʏ:* ${isEnabled(config.AUTO_STATUS_REPLY) ? "✅" : "❌"}
│  ├─∘ *sᴛᴀᴛᴜs ʀᴇᴀᴄᴛ:* ${isEnabled(config.AUTO_STATUS_REACT) ? "✅" : "❌"}
│  └─∘ *sᴛᴀᴛᴜs ᴍsɢ:* ${config.AUTO_STATUS_MSG}
│
├─❏ *🛡️ 𝐒𝐄𝐂𝐔𝐑𝐈𝐓𝐘*
│  ├─∘ *Anti-Link:* ${isEnabled(config.ANTI_LINK) ? "✅" : "❌"}
│  ├─∘ *ᴀɴᴛɪ-ʙᴀᴅ:* ${isEnabled(config.ANTI_BAD) ? "✅" : "❌"}
│  ├─∘ *ᴀɴᴛɪ-ᴠᴠ:* ${isEnabled(config.ANTI_VV) ? "✅" : "❌"}
│  └─∘ *ᴅᴇʟ ʟɪɴᴋs:* ${isEnabled(config.DELETE_LINKS) ? "✅" : "❌"}
│
├─❏ *🎨 𝐌𝐄𝐃𝐈𝐀*
│  ├─∘ *ᴀʟɪᴠᴇ ɪᴍɢ:* ${config.ALIVE_IMG}
│  ├─∘ *ᴍᴇɴᴜ ɪᴍɢ:* ${config.MENU_IMAGE_URL}
│  ├─∘ *ᴀʟɪᴠᴇ ᴍsɢ:* ${config.LIVE_MSG}
│  └─∘ *sᴛɪᴄᴋᴇʀ ᴘᴀᴄᴋ:* ${config.STICKER_NAME}
│
├─❏ *⏳ 𝐌𝐈𝐒𝐂*
│  ├─∘ *ᴀᴜᴛᴏ ᴛʏᴘɪɴɢ:* ${isEnabled(config.AUTO_TYPING) ? "✅" : "❌"}
│  ├─∘ *ᴀᴜᴛᴏ ʀᴇᴄᴏʀᴅ:* ${isEnabled(config.AUTO_RECORDING) ? "✅" : "❌"}
│  ├─∘ *ᴀɴᴛɪ-ᴅᴇʟ ᴘᴀᴛʜ:* ${config.ANTI_DEL_PATH}
│  └─∘ *ᴅᴇᴠ ɴᴜᴍʙᴇʀ:* ${config.DEV}
│
╰───『 *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ* 』──❏
`;

        await conn.sendMessage(
            from,
            {
                image: { url: `https://files.catbox.moe/w1l8b0.jpg` },
                caption: envSettings,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true
                }
            },
            { quoted: mek }
        );


    } catch (error) {
        console.error('Env command error:', error);
        reply(`❌ Error displaying config: ${error.message}`);
    }
});
