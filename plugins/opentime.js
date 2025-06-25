const config = require('../config');
const { cmd } = require('../command');

// Parse time duration from arguments
function parseDuration(value, unit) {
    const multipliers = {
        second: 1000,
        seconds: 1000,
        minute: 60000,
        minutes: 60000,
        hour: 3600000,
        hours: 3600000,
        day: 86400000,
        days: 86400000
    };
    if (isNaN(value)) return null;
    return multipliers[unit.toLowerCase()] ? parseInt(value) * multipliers[unit.toLowerCase()] : null;
}

cmd({
    pattern: "opentime",
    react: "🔖",
    desc: "Temporarily open group for a specific time",
    category: "group",
    use: ".opentime 10 minutes",
    filename: __filename
}, async (conn, mek, m, { from, args, isGroup, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply("ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴏɴʟʏ ᴡᴏʀᴋs ɪɴ ɢʀᴏᴜᴘs.");
        if (!isAdmins) return reply("ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");

        const timer = parseDuration(args[0], args[1]);
        if (!timer) return reply("*ᴄʜᴏᴏsᴇ ᴀ ᴠᴀʟɪᴅ ᴜɴɪᴛ:*\nsᴇᴄᴏɴᴅs, ᴍɪɴᴜᴛᴇs, ʜᴏᴜʀs, ᴅᴀʏs\n\n*ᴇxᴀᴍᴘʟᴇ:*\n10 ᴍɪɴᴜᴛᴇs");

        reply(`*ɢʀᴏᴜᴘ ᴡɪʟʟ ʙᴇ ᴏᴘᴇɴᴇᴅ ғᴏʀ ${args[0]} ${args[1]}.*`);
        await conn.groupSettingUpdate(from, 'not_announcement');

        setTimeout(async () => {
            await conn.groupSettingUpdate(from, 'announcement');
            await conn.sendMessage(from, { text: `*⏱️ TIME'S UP*\nɢʀᴏᴜᴘ ɪs ɴᴏᴡ ᴄʟᴏsᴇᴅ. ᴏɴʟʏ ᴀᴅᴍɪɴs ᴄᴀɴ sᴇɴᴅ ᴍᴇssᴀɢᴇs. 🔐` });
        }, timer);

        await conn.sendMessage(from, { react: { text: `✅`, key: mek.key } });
    } catch (e) {
        reply("*An error occurred while opening the group.*");
        console.error(e);
    }
});

cmd({
    pattern: "closetime",
    react: "🔖",
    desc: "Temporarily close group for a specific time",
    category: "group",
    use: ".closetime 10 minutes",
    filename: __filename
}, async (conn, mek, m, { from, args, isGroup, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply("ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴏɴʟʏ ᴡᴏʀᴋs ɪɴ ɢʀᴏᴜᴘs.");
        if (!isAdmins) return reply("ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");

        const timer = parseDuration(args[0], args[1]);
        if (!timer) return reply("*ᴄʜᴏᴏsᴇ ᴀ ᴠᴀʟɪᴅ ᴜɴɪᴛ:*\nsᴇᴄᴏɴᴅs, ᴍɪɴᴜᴛᴇs, ʜᴏᴜʀs, ᴅᴀʏs\n\n*ᴇxᴀᴍᴘʟᴇ:*\n10 ᴍɪɴᴜᴛᴇs");

        reply(`*ɢʀᴏᴜᴘ ᴡɪʟʟ ʙᴇ ᴄʟᴏsᴇᴅ ғᴏʀ ${args[0]} ${args[1]}.*`);
        await conn.groupSettingUpdate(from, 'announcement');

        setTimeout(async () => {
            await conn.groupSettingUpdate(from, 'not_announcement');
            await conn.sendMessage(from, { text: `*⏱️ TIME'S UP*\nɢʀᴏᴜᴘ ɪs ɴᴏᴡ ᴏᴘᴇɴ. ᴀʟʟ ᴍᴇᴍʙᴇʀs ᴄᴀɴ sᴇɴᴅ ᴍᴇssᴀɢᴇs. 🔓` });
        }, timer);

        await conn.sendMessage(from, { react: { text: `✅`, key: mek.key } });
    } catch (e) {
        reply("*An error occurred while closing the group.*");
        console.error(e);
    }
});
