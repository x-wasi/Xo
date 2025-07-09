const { cmd } = require('../command');

// Kick all non-admin members
cmd({
    pattern: "kickall",
    alias: ["removemember", "endgc", "endgroup"],
    desc: "Remove all non-admin members from the group.",
    react: "🎉",
    category: "group",
    filename: __filename,
}, async (conn, mek, m, {
    from, groupMetadata, groupAdmins, isBotAdmins, isGroup, isOwner, isAdmins, reply
}) => {
    try {
        if (!isGroup) return reply("This command can only be used in groups.");
        if (!isOwner && !isAdmins) return reply("Only the bot owner or group admins can use this command.");
        if (!isBotAdmins) return reply("I need to be an admin to execute this command.");

        const nonAdmins = groupMetadata.participants.filter(p => !groupAdmins.includes(p.id));
        if (nonAdmins.length === 0) return reply("There are no non-admin members to remove.");

        reply(`Removing ${nonAdmins.length} non-admin members...`);
        await Promise.all(nonAdmins.map(p =>
            conn.groupParticipantsUpdate(from, [p.id], "remove").catch(e =>
                console.error(`❌ Failed to remove ${p.id}:`, e))
        ));
        reply("✅ Successfully removed all non-admin members.");
    } catch (e) {
        console.error(e);
        reply("❌ Error occurred while removing non-admin members.");
    }
});

// Kick all admins except bot and owner
cmd({
    pattern: "removeadmins",
    alias: ["kickadmins", "kickall3", "deladmins"],
    desc: "Remove all admin members, excluding bot and owner.",
    react: "🎉",
    category: "group",
    filename: __filename,
}, async (conn, mek, m, {
    from, groupMetadata, groupAdmins, isBotAdmins, isGroup, isOwner, isAdmins, reply
}) => {
    try {
        if (!isGroup) return reply("This command can only be used in groups.");
        if (!isOwner && !isAdmins) return reply("Only the bot owner or group admins can use this command.");
        if (!isBotAdmins) return reply("I need to be an admin to execute this command.");

        const botOwner = conn.user.id.split(":")[0];
        const admins = groupMetadata.participants.filter(p =>
            groupAdmins.includes(p.id) &&
            p.id !== conn.user.id &&
            p.id !== `${botOwner}@s.whatsapp.net`
        );

        if (admins.length === 0) return reply("No admin members to remove.");

        reply(`Removing ${admins.length} admin members...`);
        await Promise.all(admins.map(p =>
            conn.groupParticipantsUpdate(from, [p.id], "remove").catch(e =>
                console.error(`❌ Failed to remove ${p.id}:`, e))
        ));
        reply("✅ Successfully removed all targeted admin members.");
    } catch (e) {
        console.error(e);
        reply("❌ Error occurred while removing admin members.");
    }
});

// Kick all members except bot and owner
cmd({
    pattern: "kickall2",
    alias: ["removemember2", "endgc2", "endgroup2"],
    desc: "Remove all members from the group except bot and owner.",
    react: "🎉",
    category: "group",
    filename: __filename,
}, async (conn, mek, m, {
    from, groupMetadata, isBotAdmins, isGroup, isOwner, isAdmins, reply
}) => {
    try {
        if (!isGroup) return reply("This command can only be used in groups.");
        if (!isOwner && !isAdmins) return reply("Only the bot owner or group admins can use this command.");
        if (!isBotAdmins) return reply("I need to be an admin to execute this command.");

        const botOwner = conn.user.id.split(":")[0];
        const toRemove = groupMetadata.participants.filter(p =>
            p.id !== conn.user.id && p.id !== `${botOwner}@s.whatsapp.net`
        );

        if (toRemove.length === 0) return reply("No members to remove.");

        reply(`Removing ${toRemove.length} members...`);
        await Promise.all(toRemove.map(p =>
            conn.groupParticipantsUpdate(from, [p.id], "remove").catch(e =>
                console.error(`❌ Failed to remove ${p.id}:`, e))
        ));
        reply("✅ Successfully removed all members (except bot and owner).");
    } catch (e) {
        console.error(e);
        reply("❌ Error occurred while removing members.");
    }
});

// Kick members via group link
cmd({
    pattern: "purger",
    desc: "Remove members from a group via invite link. Add 'all' to include admins.",
    react: "💀",
    category: "group",
    filename: __filename,
}, async (conn, m, store, { args, reply }) => {
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

        const metadata = await conn.groupMetadata(groupJid);
        const botJid = conn.decodeJid(conn.user.id);
        const isBotAdmin = metadata.participants.some(p => p.id === botJid && p.admin);

        if (!isBotAdmin) return reply("❌ I must be an admin in that group to purge members.");

        const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
        const targets = metadata.participants
            .filter(p => p.id !== botJid)
            .filter(p => removeAll ? true : !admins.includes(p.id));

        if (targets.length === 0) return reply("✅ No members to remove.");

        reply(`⏳ Removing ${targets.length} member(s) from *${metadata.subject}*...`);
        await Promise.all(targets.map(p =>
            conn.groupParticipantsUpdate(groupJid, [p.id], "remove").catch(e =>
                console.error(`❌ Failed to remove ${p.id}:`, e))
        ));

        reply(`✅ Successfully removed ${targets.length} member(s) from *${metadata.subject}*`);
    } catch (e) {
        console.error("❌ Purge error:", e.message || e);
        reply("❌ Failed to purge members. Make sure the link is valid and the bot is admin in the group.");
    }
});
