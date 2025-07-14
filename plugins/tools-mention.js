const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "mention-reply",
    alias: ["mee", "mentionreply", "mention"],
    description: "Enable or disable mention reply feature.",
    category: "settings",
    filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator && !isOwner) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();

    if (status === "on") {
        config.MENTION_REPLY = "true";
        return reply("✅ ᴍᴇɴᴛɪᴏɴ ʀᴇᴘʟʏ ғᴇᴀᴛᴜʀᴇ ɪs ɴᴏᴡ *ᴇɴᴀʙʟᴇᴅ*.");
    } else if (status === "off") {
        config.MENTION_REPLY = "false";
        return reply("🚫 ᴍᴇɴᴛɪᴏɴ ʀᴇᴘʟʏ ғᴇᴀᴛᴜʀᴇ ɪs ɴᴏᴡ *ᴅɪsᴀʙʟᴇᴅ*.");
    } else {
        return reply("⚠️ ᴜsᴀɢᴇ: *.mee ᴏɴ* ᴏʀ *.mee ᴏғғ*");
    }
});
