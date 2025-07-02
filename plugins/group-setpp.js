const { cmd } = require('../command');

cmd({
    pattern: "setppgc",
    alias: ["gpp", "setppg"]
    desc: "Change group profile picture",
    category: "group",
    react: "🖼️",
    filename: __filename
}, async (conn, m, { isGroup, isBotAdmins, isAdmins, reply }) => {
    if (!isGroup) return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs.");
    if (!isAdmins) return reply("❌ ʏᴏᴜ ᴍᴜsᴛ ʙᴇ ᴀɴ *ᴀᴅᴍɪɴ* ᴛᴏ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
    if (!isBotAdmins) return reply("❌ ɪ ɴᴇᴇᴅ ᴛᴏ ʙᴇ ᴀɴ *ᴀᴅᴍɪɴ* to ᴄʜᴀɴɢᴇ ᴛʜᴇ ɢʀᴏᴜᴘ ᴘʜᴏᴛᴏ.");

    const q = m.quoted || m;
    const mime = (q.msg || q).mimetype || '';

    if (!mime.startsWith('image/')) return reply("🖼️ *ʀᴇᴘʟʏ ᴛᴏ ᴀɴ ɪᴍᴀɢᴇ* ᴡɪᴛʜ `.sᴇᴛᴘᴘɢᴄ` ᴛᴏ sᴇᴛ ᴛʜᴇ ɢʀᴏᴜᴘ ᴘʀᴏғɪʟᴇ ᴘɪᴄᴛᴜʀᴇ.");

    try {
        const img = await q.download();
        await conn.updateProfilePicture(m.chat, img);
        reply("> ✅ ɢʀᴏᴜᴘ ᴘʀᴏғɪʟᴇ ᴘɪᴄᴛᴜʀᴇ ᴜᴘᴅᴀᴛᴇᴅ!");
    } catch (e) {
        reply("❌ Failed to update group picture.\n" + e.message);
    }
});
