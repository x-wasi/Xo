const { cmd } = require('../command');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// remove only non-admin members
cmd({
    pattern: "removemembers",
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
                await sleep(500);
            } catch (e) {
                console.error(`Failed to remove ${participant.id}:`, e);
            }
        }

        reply("sᴜᴄᴄᴇssғᴜʟʟʏ ʀᴇᴍᴏᴠᴇᴅ ᴀʟʟ ɴᴏɴ-ᴀᴅᴍɪɴ ᴍᴇᴍʙᴇʀs ғʀᴏᴍ the ɢʀᴏᴜᴘ.");
    } catch (e) {
        console.error("Error removing non-admin users:", e);
        reply("An error occurred while trying to remove non-admin members. Please try again.");
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
        if (!isGroup) return reply("This command can only be used in groups.");

        if (!isOwner && !isAdmins) {
            return reply("Only the bot owner or group admins can use this command.");
        }

        if (!isBotAdmins) {
            return reply("I need to be an admin to execute this command.");
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

        reply(`sᴛᴀʀᴛɪɴɢ ᴛᴏ ʀᴇᴍᴏᴠᴇ ${adminParticipants.length} ᴀᴅᴍɪɴ ᴍᴇᴍʙᴇʀs, ᴇxᴄʟᴜᴅɪɴɢ ᴛʜᴇ ʙᴏᴛ ᴀɴᴅ ʙᴏᴛ ᴏᴡɴᴇʀ...`);

        for (let participant of adminParticipants) {
            try {
                await conn.groupParticipantsUpdate(from, [participant.id], "remove");
                await sleep(500);
            } catch (e) {
                console.error(`ғᴀɪʟᴇᴅ ᴛᴏ ʀᴇᴍᴏᴠᴇ ${participant.id}:`, e);
            }
        }

        reply("sᴜᴄᴄᴇssғᴜʟʟʏ ʀᴇᴍᴏᴠᴇᴅ ᴀʟʟ ᴀᴅᴍɪɴ ᴍᴇᴍʙᴇʀs ғʀᴏᴍ ᴛʜᴇ ɢʀᴏᴜᴘ, ᴇxᴄʟᴜᴅɪɴɢ ᴛʜᴇ ʙᴏᴛ ᴀɴᴅ ʙᴏᴛ ᴏᴡɴᴇʀ.");
    } catch (e) {
        console.error("Error removing admins:", e);
        reply("An error occurred while trying to remove admins. Please try again.");
    }
});

// remove all members except bot and owner
cmd({
    pattern: "removeall2",
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
            return reply("ɪ ɴᴇᴇᴅ ᴛᴏ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ᴇxᴇᴄᴜᴛᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
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
                await sleep(500);
            } catch (e) {
                console.error(`Failed to remove ${participant.id}:`, e);
            }
        }

        reply("sᴜᴄᴄᴇssғᴜʟʟʏ ʀᴇᴍᴏᴠᴇᴅ ᴀʟʟ ᴍᴇᴍʙᴇʀs, ᴇxᴄʟᴜᴅɪɴɢ ᴛʜᴇ ʙᴏᴛ ᴀɴᴅ ʙᴏᴛ ᴏᴡɴᴇʀ, ғʀᴏᴍ ᴛʜᴇ ɢʀᴏᴜᴘ.");
    } catch (e) {
        console.error("Error removing members:", e);
        reply("An error occurred while trying to remove members. Please try again.");
    }
});

// kickall private 

const { cmd } = require('../command');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

cmd({
    pattern: "purger",
    desc: "Remove members from a group via invite link. Add 'all' to remove admins too.",
    react: "💀",
    category: "group",
    filename: __filename
},
async (conn, m, store, { args, reply }) => {
    const groupLink = args[0];
    const removeAll = args[1] === 'all';

    if (!groupLink || !groupLink.includes("chat.whatsapp.com/")) {
        return reply("❌ Provide a valid WhatsApp group link.\n*Usage:* .purger <link> [all]");
    }

    const inviteCode = groupLink.split("chat.whatsapp.com/")[1].trim();

    try {
        let groupJid;

        try {
            groupJid = await conn.groupAcceptInvite(inviteCode);
            console.log("[BOT] Joined group:", groupJid);
        } catch (err) {
            console.log("[BOT] Could not join, trying to fetch info...");
            const groupInfo = await conn.groupGetInviteInfo(inviteCode);
            groupJid = groupInfo.id + "@g.us";
        }

        await sleep(1500); // wait for metadata to be available
        const metadata = await conn.groupMetadata(groupJid);

        const botJid = conn.decodeJid(conn.user.id);
        const isBotAdmin = metadata.participants.some(p => p.id === botJid && p.admin);

        if (!isBotAdmin) {
            return reply("❌ I must be an admin in that group to purge members.");
        }

        const admins = metadata.participants
            .filter(p => p.admin)
            .map(p => p.id);

        const targets = metadata.participants
            .filter(p => p.id !== botJid)
            .filter(p => removeAll ? true : !admins.includes(p.id));

        if (targets.length === 0) {
            return reply("✅ No members to remove.");
        }

        reply(`⏳ Removing ${targets.length} member(s) from *${metadata.subject}*...`);

        for (const member of targets) {
            try {
                await conn.groupParticipantsUpdate(groupJid, [member.id], "remove");
                await sleep(700);
            } catch (e) {
                console.error(`❌ Failed to remove ${member.id}:`, e.message);
            }
        }

        return reply(`✅ Successfully removed ${targets.length} member(s) from *${metadata.subject}*`);
    } catch (e) {
        console.error("❌ Purge error:", e.message || e);
        return reply("❌ Failed to purge members. Make sure the link is valid and the bot is admin in the group.");
    }
});
