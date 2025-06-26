const fs = require("fs");
const { cmd } = require("../command");

function getBannedList() {
    const banFile = "./lib/ban.json";
    if (!fs.existsSync(banFile)) fs.writeFileSync(banFile, JSON.stringify([]));
    return JSON.parse(fs.readFileSync(banFile, "utf-8"));
}

function saveBannedList(list) {
    fs.writeFileSync("./lib/ban.json", JSON.stringify([...new Set(list)], null, 2));
}

// ⛔ ʙᴀɴ ᴄᴏᴍᴍᴀɴᴅ
cmd({
    pattern: "ban",
    alias: ["blockuser", "addban"],
    desc: "ʙᴀɴ ᴀ ᴜsᴇʀ ғʀᴏᴍ ᴜsɪɴɢ ᴛʜᴇ ʙᴏᴛ",
    category: "owner",
    react: "⛔",
    filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("_❗ᴏɴʟʏ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ._");

        let target = m.mentionedJid?.[0]
            || (m.quoted?.sender ?? null)
            || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net");

        if (!target || !target.includes("@s.whatsapp.net")) {
            return reply("❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ɴᴜᴍʙᴇʀ, ᴛᴀɢ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ.");
        }

        if (target === m.sender || target === conn.user?.id) {
            return reply("❌ ʏᴏᴜ ᴄᴀɴ'ᴛ ʙᴀɴ ʏᴏᴜʀsᴇʟғ ᴏʀ ᴛʜᴇ ʙᴏᴛ.");
        }

        let banned = getBannedList();
        if (banned.includes(target)) return reply("❌ ᴛʜɪs ᴜsᴇʀ ɪs ᴀʟʀᴇᴀᴅʏ ʙᴀɴɴᴇᴅ.");

        banned.push(target);
        saveBannedList(banned);

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/phamfv.jpg" },
            caption: `⛔ ᴜsᴇʀ ʜᴀs ʙᴇᴇɴ ʙᴀɴɴᴇᴅ ғʀᴏᴍ ᴜsɪɴɢ ᴛʜᴇ ʙᴏᴛ:\n\n@${target.split("@")[0]}`,
            mentions: [target]
        }, { quoted: mek });

    } catch (err) {
        console.error(err);
        reply("❌ ᴇʀʀᴏʀ: " + err.message);
    }
});

// ✅ ᴜɴʙᴀɴ
cmd({
    pattern: "unban",
    alias: ["removeban"],
    desc: "ᴜɴʙᴀɴ ᴀ ᴜsᴇʀ",
    category: "owner",
    react: "✅",
    filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("_❗ᴏɴʟʏ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ._");

        let target = m.mentionedJid?.[0]
            || (m.quoted?.sender ?? null)
            || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net");

        if (!target || !target.includes("@s.whatsapp.net")) {
            return reply("❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ɴᴜᴍʙᴇʀ, ᴛᴀɢ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ.");
        }

        let banned = getBannedList();
        if (!banned.includes(target)) return reply("❌ ᴛʜɪs ᴜsᴇʀ ɪs ɴᴏᴛ ʙᴀɴɴᴇᴅ.");

        banned = banned.filter(u => u !== target);
        saveBannedList(banned);

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/phamfv.jpg" },
            caption: `✅ ᴜsᴇʀ ʜᴀs ʙᴇᴇɴ ᴜɴʙᴀɴɴᴇᴅ:\n\n@${target.split("@")[0]}`,
            mentions: [target]
        }, { quoted: mek });

    } catch (err) {
        console.error(err);
        reply("❌ ᴇʀʀᴏʀ: " + err.message);
    }
});

// 📋 ʟɪsᴛ ᴏғ ʙᴀɴɴᴇᴅ ᴜsᴇʀs
cmd({
    pattern: "listban",
    alias: ["banlist", "bannedusers"],
    desc: "ʟɪsᴛ ᴀʟʟ ʙᴀɴɴᴇᴅ ᴜsᴇʀs",
    category: "owner",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { from, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("_❗ᴏɴʟʏ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ._");

        let banned = getBannedList();
        if (banned.length === 0) return reply("✅ ɴᴏ ʙᴀɴɴᴇᴅ ᴜsᴇʀs ғᴏᴜɴᴅ.");

        let msg = `⛔ *ʙᴀɴɴᴇᴅ ᴜsᴇʀs ʟɪsᴛ:*\n\n`;

        for (let i = 0; i < banned.length; i++) {
            let name = conn.getName ? await conn.getName(banned[i]) : banned[i];
            msg += `${i + 1}. ${name} (${banned[i].replace("@s.whatsapp.net", "")})\n`;
        }

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/phamfv.jpg" },
            caption: msg
        }, { quoted: mek });

    } catch (err) {
        console.error(err);
        reply("❌ ᴇʀʀᴏʀ: " + err.message);
    }
});
