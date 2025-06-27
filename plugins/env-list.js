const fs = require('fs');
const path = require('path');
const config = require('../config');
const { cmd } = require('../command');

function updateEnvVariable(key, value) {
    const envPath = path.join(__dirname, "../.env");
    let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    const regex = new RegExp(`^${key}=.*`, "m");

    if (regex.test(env)) {
        env = env.replace(regex, `${key}=${value}`);
    } else {
        env += `\n${key}=${value}`;
    }

    fs.writeFileSync(envPath, env);

    // ری‌لود کردن dotenv و config
    require('dotenv').config({ path: envPath });

    // پاک‌سازی کش config
    delete require.cache[require.resolve('../config')];
    Object.assign(config, require('../config'));  // ری‌لود
}

function isEnabled(value) {
    return value && value.toString().toLowerCase() === "true";
}

cmd({
    pattern: "env",
    alias: ["config", "settings"],
    desc: "Bot config control panel via reply menu (ENV based)",
    category: "system",
    react: "⚙️",
    filename: __filename
}, 
async (conn, mek, m, { from, reply, isCreator }) => {
    if (!isCreator) return reply("ᴄᴏᴍᴍᴀɴᴅ ʀᴇsᴇʀᴠᴇᴅ ғᴏʀ ᴏᴡɴᴇʀ ᴀɴᴅ ᴍʏ ᴄʀᴇᴀᴛᴏʀ ᴀʟᴏɴᴇ");

    const menu = `
*1. ᴀᴜᴛᴏ ғᴇᴀᴛᴜʀᴇs*
╰ 1.1 - 𝐀𝐔𝐓𝐎_𝐑𝐄𝐏𝐋𝐘 (${isEnabled(config.AUTO_REPLY) ? "✅" : "❌"})
╰ 1.2 - 𝐀𝐔𝐓𝐎_𝐑𝐄𝐀𝐂𝐓 (${isEnabled(config.AUTO_REACT) ? "✅" : "❌"})

*2. sᴇᴄᴜʀɪᴛʏ*
╰ 2.1 - 𝐀𝐍𝐓𝐈_𝐋𝐈𝐍𝐊 (${isEnabled(config.ANTI_LINK) ? "✅" : "❌"})
╰ 2.2 - 𝐀𝐍𝐓𝐈_𝐁𝐀𝐃 (${isEnabled(config.ANTI_BAD) ? "✅" : "❌"})
╰ 2.3 - 𝐃𝐄𝐋𝐄𝐓𝐄_𝐋𝐈𝐍𝐊𝐒 (${isEnabled(config.DELETE_LINKS) ? "✅" : "❌"})

*3. 𝐒𝐭𝐚𝐭𝐮𝐬 sʏsᴛᴇᴍ*
╰ 3.1 - 𝐀𝐔𝐓𝐎_𝐒𝐓𝐀𝐓𝐔𝐒_𝐒𝐄𝐄𝐍 (${isEnabled(config.AUTO_STATUS_SEEN) ? "✅" : "❌"})
╰ 3.2 - 𝐀𝐔𝐓𝐎_𝐒𝐓𝐀𝐓𝐔𝐒_𝐑𝐄𝐏𝐋𝐘 (${isEnabled(config.AUTO_STATUS_REPLY) ? "✅" : "❌"})
╰ 3.3 - 𝐀𝐔𝐓𝐎_𝐒𝐓𝐀𝐓𝐔𝐒_𝐑𝐄𝐀𝐂𝐓 (${isEnabled(config.AUTO_STATUS_REACT) ? "✅" : "❌"})

*4. ᴄᴏʀᴇ*
╰ 4.1 - 𝐀𝐋𝐖𝐀𝐘𝐒_𝐎𝐍𝐋𝐈𝐍𝐄 (${isEnabled(config.ALWAYS_ONLINE) ? "✅" : "❌"})
╰ 4.2 - 𝐑𝐄𝐀𝐃_𝐌𝐄𝐒𝐒𝐀𝐆𝐄 (${isEnabled(config.READ_MESSAGE) ? "✅" : "❌"})
╰ 4.3 - 𝐑𝐄𝐀𝐃_𝐂𝐌𝐃 (${isEnabled(config.READ_CMD) ? "✅" : "❌"})
╰ 4.4 - 𝐏𝐔𝐁𝐋𝐈𝐂_𝐌𝐎𝐃𝐄 (${isEnabled(config.PUBLIC_MODE) ? "✅" : "❌"})

*5. ᴛʏᴘɪɴɢ/ʀᴇᴄᴏʀᴅɪɴɢ*
╰ 5.1 - 𝐀𝐔𝐓𝐎_𝐓𝐘𝐏𝐈𝐍𝐆 (${isEnabled(config.AUTO_TYPING) ? "✅" : "❌"})
╰ 5.2 - 𝐀𝐔𝐓𝐎_𝐑𝐄𝐂𝐎𝐑𝐃𝐈𝐍𝐆 (${isEnabled(config.AUTO_RECORDING) ? "✅" : "❌"})

_ʀᴇᴘʟʏ ᴡɪᴛʜ: 1.1, 2.2, ᴇᴛᴄ ᴛᴏ ᴛᴏɢɢʟᴇ ᴏɴ/ᴏғғ_
`;

    const sent = await conn.sendMessage(from, {
    caption: menu,
    image: { url: "https://files.catbox.moe/2ozipw.jpg" }  // عکس تستی
}, { quoted: mek });

    const messageID = sent.key.id;

    const toggleSetting = (key) => {
        const current = isEnabled(config[key]);
        updateEnvVariable(key, current ? "false" : "true");
        return `✅ *${key}* ɪs ɴᴏᴡ sᴇᴛ ᴛᴏ: *${!current ? "ᴏɴ" : "ᴏғғ"}*`;
    };

    const handler = async (msgData) => {
        const msg = msgData.messages[0];
        const quotedId = msg?.message?.extendedTextMessage?.contextInfo?.stanzaId;

        if (quotedId !== messageID) return;

        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";

        const map = {
            "1.1": "AUTO_REPLY", "1.2": "AUTO_REACT", 
            "2.1": "ANTI_LINK", "2.2": "ANTI_BAD", "2.3": "DELETE_LINKS",
            "3.1": "AUTO_STATUS_SEEN", "3.2": "AUTO_STATUS_REPLY", "3.3": "AUTO_STATUS_REACT",
            "4.1": "ALWAYS_ONLINE", "4.2": "READ_MESSAGE", "4.3": "READ_CMD", "4.4": "PUBLIC_MODE",
            "5.1": "AUTO_TYPING", "5.2": "AUTO_RECORDING"
        };

        const key = map[text];

        if (!key) return conn.sendMessage(from, { text: "Reply with an available number." }, { quoted: msg });

        const res = toggleSetting(key);
        await conn.sendMessage(from, { text: res }, { quoted: msg });
        conn.ev.off("messages.upsert", handler);
    };

    conn.ev.on("messages.upsert", handler);
    setTimeout(() => conn.ev.off("messages.upsert", handler), 60_000);
});
