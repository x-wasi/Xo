const { cmd } = require('../command');

cmd({
    pattern: "out",
    alias: ["ck", "bash"],
    desc: "Removes all members with specific country code from the group",
    category: "group",
    react: "❌",
    filename: __filename
},
async (conn, mek, m, {
    from, q, isGroup, isBotAdmins, reply, groupMetadata, senderNumber
}) => {
    // Check if the command is used in a group
    if (!isGroup) return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs.");

    // Get the bot owner's number dynamically from conn.user.id
    const botOwner = conn.user.id.split(":")[0];
    if (senderNumber !== botOwner) {
        return reply("❌ ᴏɴʟʏ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
    }

    // Check if the bot is an admin
    if (!isBotAdmins) return reply("❌ ɪ ɴᴇᴇᴅ ᴛᴏ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");

    if (!q) return reply("❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴄᴏᴜɴᴛʀʏ ᴄᴏᴅᴇ. ᴇxᴀᴍᴘʟᴇ: .ᴏᴜᴛ 234");

    const countryCode = q.trim();
    if (!/^\d+$/.test(countryCode)) {
        return reply("❌ ɪɴᴠᴀʟɪᴅ ᴄᴏᴜɴᴛʀʏ ᴄᴏᴅᴇ. ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴏɴʟʏ ɴᴜᴍʙᴇʀs (e.g., 234 ғᴏʀ +234 ɴᴜᴍʙᴇʀs)");
    }

    try {
        const participants = await groupMetadata.participants;
        const targets = participants.filter(
            participant => participant.id.startsWith(countryCode) && 
                         !participant.admin // Don't remove admins
        );

        if (targets.length === 0) {
            return reply(`❌ ɴᴏ ᴍᴇᴍʙᴇʀs ғᴏᴜɴᴅ ᴡɪᴛʜ ᴄᴏᴜɴᴛʀʏ ᴄᴏᴅᴇ +${countryCode}`);
        }

        const jids = targets.map(p => p.id);
        await conn.groupParticipantsUpdate(from, jids, "remove");
        
        reply(`✅ sᴜᴄᴄᴇssғᴜʟʟʏ ʀᴇᴍᴏᴠᴇᴅ ${targets.length} ᴍᴇᴍʙᴇʀs ᴡɪᴛʜ ᴄᴏᴜɴᴛʀʏ ᴄᴏᴅᴇ +${countryCode}`);
    } catch (error) {
        console.error("Out command error:", error);
        reply("❌ Failed to remove members. Error: " + error.message);
    }
});
