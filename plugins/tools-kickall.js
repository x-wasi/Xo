const { cmd } = require('../command');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// remove only non-admin members
cmd({
    pattern: "kickalls",
    alias: ["kickall", "endgc", "endgroup"],
    desc: "Remove all non-admin members from the group.",
    react: "🎉",
    category: "group",
    filename: __filename,
}, 
async (conn, mek, m, {
    from, groupMetadata, groupAdmins, isBotAdmins, senderNumber, reply, isGroup, isOwner, isAdmins
}) => {
    try {
        if (!isGroup) return reply("ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs.");

        if (!isOwner && !isAdmins) {
            return reply("ᴏɴʟʏ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴏʀ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
        }

        if (!isBotAdmins) {
            return reply("I ɴᴇᴇᴅ ᴛᴏ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ᴇxᴇᴄᴜᴛᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
        }

        const allParticipants = groupMetadata.participants;
        const nonAdminParticipants = allParticipants.filter(member => !groupAdmins.includes(member.id));

        if (nonAdminParticipants.length === 0) {
            return reply("ᴛʜᴇʀᴇ ᴀʀᴇ ɴᴏ ɴᴏɴ-ᴀᴅᴍɪɴ ᴍᴇᴍʙᴇʀs ᴛᴏ ʀᴇᴍᴏᴠᴇ.");
        }

        reply(`sᴛᴀʀᴛɪɴɢ ᴛᴏ ʀᴇᴍᴏᴠᴇ ${nonAdminParticipants.length} ɴᴏɴ-ᴀᴅᴍɪɴ ᴍᴇᴍʙᴇʀs...`);

        for (let participant of nonAdminParticipants) {
            try {
                await conn.groupParticipantsUpdate(from, [participant.id], "remove");
                await sleep(2000);
            } catch (e) {
                console.error(`ғᴀɪʟᴇᴅ ᴛᴏ ʀᴇᴍᴏᴠᴇ ${participant.id}:`, e);
            }
        }

        reply("sᴜᴄᴄᴇssғᴜʟʟʏ ʀᴇᴍᴏᴠᴇᴅ ᴀʟʟ ɴᴏɴ-ᴀᴅᴍɪɴ ᴍᴇᴍʙᴇʀs ғʀᴏᴍ ᴛʜᴇ ɢʀᴏᴜᴘ.");
    } catch (e) {
        console.error("Error removing non-admin users:", e);
        reply("ᴀɴ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ ᴡʜɪʟᴇ ᴛʀʏɪɴɢ ᴛᴏ remove ɴᴏɴ-ᴀᴅᴍɪɴ ᴍᴇᴍʙᴇʀs. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ.");
    }
});

// remove only admins (excluding bot and owner)
cmd({
    pattern: "removeadmins",
    alias: ["kickadmins", "kickall3", "deladmins"],
    desc: "Remove all admin members from the group, excluding the bot and bot owner.",
    react: "🎉",
    category: "group",
    filename: __filename,
}, 
async (conn, mek, m, {
    from, isGroup, senderNumber, groupMetadata, groupAdmins, isBotAdmins, reply, isOwner, isAdmins
}) => {
    try {
        if (!isGroup) return reply("ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs.");

        if (!isOwner && !isAdmins) {
            return reply("ᴏɴʟʏ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴏʀ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
        }

        if (!isBotAdmins) {
            return reply("ɪ ɴᴇᴇᴅ ᴛᴏ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ᴇxᴇᴄᴜᴛᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
        }

        const botOwner = conn.user.id.split(":")[0];
        const allParticipants = groupMetadata.participants;

        const adminParticipants = allParticipants.filter(member => 
            groupAdmins.includes(member.id) &&
            member.id !== conn.user.id &&
            member.id !== `${botOwner}@s.whatsapp.net`
        );

        if (adminParticipants.length === 0) {
            return reply("There are no admin members to remove.");
        }

        reply(`sᴛᴀʀᴛɪɴɢ ᴛᴏ ʀᴇᴍᴏᴠᴇ ${adminParticipants.length} admin ᴍᴇᴍʙᴇʀs, ᴇxᴄʟᴜᴅɪɴɢ ᴛʜᴇ ʙᴏᴛ ᴀɴᴅ ʙᴏᴛ ᴏᴡɴᴇʀ...`);

        for (let participant of adminParticipants) {
            try {
                await conn.groupParticipantsUpdate(from, [participant.id], "remove");
                await sleep(2000);
            } catch (e) {
                console.error(`Failed to remove ${participant.id}:`, e);
            }
        }

        reply("sᴜᴄᴄᴇssғᴜʟʟʏ ʀᴇᴍᴏᴠᴇᴅ ᴀʟʟ ᴀᴅᴍɪɴ ᴍᴇᴍʙᴇʀs ғʀᴏᴍ ᴛʜᴇ group, excluding the bot and bot owner.");
    } catch (e) {
        console.error("Error removing admins:", e);
        reply("An error occurred while trying to remove admins. Please try again.");
    }
});

// remove all members except bot and owner
cmd({
    pattern: "kickalls2",
    alias: ["kickall2", "endgc2", "endgroup2"],
    desc: "Remove all members and admins from the group, excluding the bot and bot owner.",
    react: "🎉",
    category: "group",
    filename: __filename,
}, 
async (conn, mek, m, {
    from, isGroup, senderNumber, groupMetadata, isBotAdmins, reply, isOwner, isAdmins
}) => {
    try {
        if (!isGroup) return reply("ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs.");

        if (!isOwner && !isAdmins) {
            return reply("ᴏɴʟʏ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴏʀ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
        }

        if (!isBotAdmins) {
            return reply("I ɴᴇᴇᴅ ᴛᴏ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ᴇxᴇᴄᴜᴛᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
        }

        const botOwner = conn.user.id.split(":")[0];
        const allParticipants = groupMetadata.participants;

        if (allParticipants.length === 0) {
            return reply("ᴛʜᴇ ɢʀᴏᴜᴘ ʜᴀs ɴᴏ ᴍᴇᴍʙᴇʀs ᴛᴏ ʀᴇᴍᴏᴠᴇ.");
        }

        const participantsToRemove = allParticipants.filter(
            participant => participant.id !== conn.user.id && participant.id !== `${botOwner}@s.whatsapp.net`
        );

        if (participantsToRemove.length === 0) {
            return reply("ɴᴏ ᴍᴇᴍʙᴇʀs ᴛᴏ ʀᴇᴍᴏᴠᴇ ᴀғᴛᴇʀ ᴇxᴄʟᴜᴅɪɴɢ ᴛʜᴇ ʙᴏᴛ ᴀɴᴅ ʙᴏᴛ ᴏᴡɴᴇʀ.");
        }

        reply(`sᴛᴀʀᴛɪɴɢ ᴛᴏ ʀᴇᴍᴏᴠᴇ ${participantsToRemove.length} ᴍᴇᴍʙᴇʀs, ᴇxᴄʟᴜᴅɪɴɢ ᴛʜᴇ ʙᴏᴛ ᴀɴᴅ ʙᴏᴛ ᴏᴡɴᴇʀ...`);

        for (let participant of participantsToRemove) {
            try {
                await conn.groupParticipantsUpdate(from, [participant.id], "remove");
                await sleep(2000);
            } catch (e) {
                console.error(`Failed to remove ${participant.id}:`, e);
            }
        }

        reply("sᴜᴄᴄᴇssғᴜʟʟʏ ʀᴇᴍᴏᴠᴇᴅ ) ᴀʟʟ ᴍᴇᴍʙᴇʀs, ᴇxᴄʟᴜᴅɪɴɢ ᴛʜᴇ ʙᴏᴛ ᴀɴᴅ ʙᴏᴛ ᴏᴡɴᴇʀ, ғʀᴏᴍ the ɢʀᴏᴜᴘ.");
    } catch (e) {
        console.error("Error removing members:", e);
        reply("An error occurred while trying to remove members. Please try again.");
    }
});
