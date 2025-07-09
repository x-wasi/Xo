const { cmd } = require('../command');

// 🔥 Kick all non-admin members
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
        if (!isGroup) return reply("❌ Cette commande ne fonctionne que dans un groupe.");
        if (!isOwner && !isAdmins) return reply("❌ Seuls l’owner ou un admin peuvent utiliser cette commande.");

        if (!isBotAdmins) {
            const adminList = groupAdmins.map(jid => '• @' + jid.split('@')[0]).join('\n');
            return await reply(`❌ Le bot n’est pas admin dans ce groupe.

🔍 Bot ID: @${conn.user.id.split('@')[0]}
🔍 Admins du groupe :
${adminList}`, { mentions: groupAdmins });
        }

        const nonAdmins = groupMetadata.participants.filter(p => !groupAdmins.includes(p.id));
        if (nonAdmins.length === 0) return reply("✅ Aucun membre non-admin à supprimer.");

        reply(`🚨 Suppression de ${nonAdmins.length} membres non-admin...`);
        await Promise.all(nonAdmins.map(p =>
            conn.groupParticipantsUpdate(from, [p.id], "remove").catch(e =>
                console.error(`❌ Échec suppression ${p.id}:`, e))
        ));
        reply("✅ Tous les membres non-admin ont été supprimés.");
    } catch (e) {
        console.error("❌ Erreur kickall:", e);
        reply("❌ Une erreur s’est produite pendant la suppression.");
    }
});

// 🔥 Kick all admins (sauf bot et owner)
cmd({
    pattern: "kickall3",
    alias: ["kickadmins", "removeadmins", "deladmins"],
    desc: "Remove all admin members, excluding bot and owner.",
    react: "🎉",
    category: "group",
    filename: __filename,
}, async (conn, mek, m, {
    from, groupMetadata, groupAdmins, isBotAdmins, isGroup, isOwner, isAdmins, reply
}) => {
    try {
        if (!isGroup) return reply("❌ Cette commande ne fonctionne que dans un groupe.");
        if (!isOwner && !isAdmins) return reply("❌ Seuls l’owner ou un admin peuvent utiliser cette commande.");

        if (!isBotAdmins) {
            const adminList = groupAdmins.map(jid => '• @' + jid.split('@')[0]).join('\n');
            return await reply(`❌ Le bot n’est pas admin dans ce groupe.

🔍 Bot ID: @${conn.user.id.split('@')[0]}
🔍 Admins du groupe :
${adminList}`, { mentions: groupAdmins });
        }

        const botOwner = conn.user.id.split(":")[0];
        const admins = groupMetadata.participants.filter(p =>
            groupAdmins.includes(p.id) &&
            p.id !== conn.user.id &&
            p.id !== `${botOwner}@s.whatsapp.net`
        );

        if (admins.length === 0) return reply("✅ Aucun admin à supprimer (sauf bot et owner).");

        reply(`🚨 Suppression de ${admins.length} admins (sauf bot et owner)...`);
        await Promise.all(admins.map(p =>
            conn.groupParticipantsUpdate(from, [p.id], "remove").catch(e =>
                console.error(`❌ Échec suppression ${p.id}:`, e))
        ));
        reply("✅ Tous les admins ciblés ont été supprimés.");
    } catch (e) {
        console.error("❌ Erreur removeadmins:", e);
        reply("❌ Une erreur s’est produite pendant la suppression.");
    }
});

// 🔥 Kick all except bot and owner
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
        if (!isGroup) return reply("❌ Cette commande ne fonctionne que dans un groupe.");
        if (!isOwner && !isAdmins) return reply("❌ Seuls l’owner ou un admin peuvent utiliser cette commande.");

        if (!isBotAdmins) {
            const groupAdmins = groupMetadata.participants
                .filter(p => p.admin)
                .map(p => p.id);
            const adminList = groupAdmins.map(jid => '• @' + jid.split('@')[0]).join('\n');
            return await reply(`❌ Le bot n’est pas admin dans ce groupe.

🔍 Bot ID: @${conn.user.id.split('@')[0]}
🔍 Admins du groupe :
${adminList}`, { mentions: groupAdmins });
        }

        const botOwner = conn.user.id.split(":")[0];
        const toRemove = groupMetadata.participants.filter(p =>
            p.id !== conn.user.id && p.id !== `${botOwner}@s.whatsapp.net`
        );

        if (toRemove.length === 0) return reply("✅ Aucun membre à supprimer.");

        reply(`🚨 Suppression de ${toRemove.length} membres (sauf bot et owner)...`);
        await Promise.all(toRemove.map(p =>
            conn.groupParticipantsUpdate(from, [p.id], "remove").catch(e =>
                console.error(`❌ Échec suppression ${p.id}:`, e))
        ));
        reply("✅ Tous les membres ciblés ont été supprimés.");
    } catch (e) {
        console.error("❌ Erreur kickall2:", e);
        reply("❌ Une erreur s’est produite pendant la suppression.");
    }
});

// 🔥 Purger via lien de groupe
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
        return reply("❌ Donne un lien de groupe valide.\n*Exemple:* .purger <lien> [all]");
    }

    const inviteCode = groupLink.split("chat.whatsapp.com/")[1].trim();

    try {
        let groupJid;
        try {
            groupJid = await conn.groupAcceptInvite(inviteCode);
        } catch {
            const groupInfo = await conn.groupGetInviteInfo(inviteCode);
            groupJid = groupInfo.id + "@g.us";
        }

        const metadata = await conn.groupMetadata(groupJid);
        const botJid = conn.decodeJid(conn.user.id);
        const isBotAdmin = metadata.participants.some(p => p.id === botJid && p.admin);

        if (!isBotAdmin) {
            const adminList = metadata.participants
                .filter(p => p.admin)
                .map(p => '• @' + p.id.split('@')[0])
                .join('\n');
            return await reply(`❌ Le bot n’est pas admin dans ce groupe.

🔍 Bot ID: @${botJid.split('@')[0]}
🔍 Admins du groupe :
${adminList}`, {
                mentions: metadata.participants.filter(p => p.admin).map(p => p.id)
            });
        }

        const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
        const targets = metadata.participants
            .filter(p => p.id !== botJid)
            .filter(p => removeAll ? true : !admins.includes(p.id));

        if (targets.length === 0) return reply("✅ Aucun membre à supprimer.");

        reply(`🚨 Suppression de ${targets.length} membres dans *${metadata.subject}*...`);
        await Promise.all(targets.map(p =>
            conn.groupParticipantsUpdate(groupJid, [p.id], "remove").catch(e =>
                console.error(`❌ Échec suppression ${p.id}:`, e))
        ));
        reply(`✅ Tous les membres ont été supprimés de *${metadata.subject}*.`);
    } catch (e) {
        console.error("❌ Erreur purger:", e);
        reply("❌ Une erreur est survenue pendant la purge.");
    }
});
