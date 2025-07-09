const { cmd } = require('../command');

// ✅ Supprimer tous les NON-ADMINS (commande .kickall)
cmd({
  pattern: "kickall",
  desc: "Kick all non-admin members from the group.",
  react: "💥",
  category: "group",
  filename: __filename
}, async (conn, m, {
  from, isGroup, isBotAdmins, isAdmins, isOwner, reply
}) => {
  if (!isGroup) return reply("❌ Cette commande fonctionne uniquement dans un groupe.");
  if (!isOwner && !isAdmins) return reply("❌ Seuls l’owner ou admin peuvent utiliser cette commande.");
  if (!isBotAdmins) return reply("❌ Le bot n’est pas admin dans ce groupe.");

  const metadata = await conn.groupMetadata(from);
  const botJid = conn.decodeJid(conn.user.id);
  const adminJids = metadata.participants.filter(p => p.admin).map(p => p.id);

  const toKick = metadata.participants.filter(p =>
    !adminJids.includes(p.id) &&
    p.id !== botJid
  );

  if (toKick.length === 0) return reply("✅ Aucun non-admin à retirer.");

  reply(`🚨 Suppression de ${toKick.length} membres non-admin...`);

  for (const user of toKick) {
    await conn.groupParticipantsUpdate(from, [user.id], "remove")
      .catch(e => console.error(`❌ ${user.id} erreur: ${e.message}`));
  }

  reply("✅ Tous les non-admins ont été supprimés.");
});


// ✅ Supprimer TOUS LES MEMBRES sauf le bot et owner (commande .kickall2)
cmd({
  pattern: "kickall2",
  desc: "Kick all members except bot and owner.",
  react: "☠️",
  category: "group",
  filename: __filename
}, async (conn, m, {
  from, isGroup, isBotAdmins, isAdmins, isOwner, reply
}) => {
  if (!isGroup) return reply("❌ Commande pour groupes uniquement.");
  if (!isOwner && !isAdmins) return reply("❌ Seuls owner ou admin peuvent utiliser ça.");
  if (!isBotAdmins) return reply("❌ Le bot doit être admin.");

  const metadata = await conn.groupMetadata(from);
  const botJid = conn.decodeJid(conn.user.id);
  const ownerJid = `${conn.user.id.split(":")[0]}@s.whatsapp.net`;

  const toKick = metadata.participants.filter(p =>
    p.id !== botJid && p.id !== ownerJid
  );

  if (toKick.length === 0) return reply("✅ Aucun membre à supprimer.");

  reply(`☠️ Suppression de ${toKick.length} membres...`);

  for (const user of toKick) {
    await conn.groupParticipantsUpdate(from, [user.id], "remove")
      .catch(e => console.error(`❌ ${user.id} erreur: ${e.message}`));
  }

  reply("✅ Tous les membres ont été supprimés.");
});


// ✅ Supprimer tous les ADMINS sauf le bot et owner (commande .removeadmins)
cmd({
  pattern: "removeadmins",
  desc: "Kick all group admins except bot and owner.",
  react: "👑",
  category: "group",
  filename: __filename
}, async (conn, m, {
  from, isGroup, isBotAdmins, isAdmins, isOwner, reply
}) => {
  if (!isGroup) return reply("❌ Groupe uniquement.");
  if (!isOwner && !isAdmins) return reply("❌ Seul l’owner ou un admin peut utiliser cette commande.");
  if (!isBotAdmins) return reply("❌ Le bot n’est pas admin.");

  const metadata = await conn.groupMetadata(from);
  const botJid = conn.decodeJid(conn.user.id);
  const ownerJid = `${conn.user.id.split(":")[0]}@s.whatsapp.net`;

  const admins = metadata.participants.filter(p =>
    p.admin &&
    p.id !== botJid &&
    p.id !== ownerJid
  );

  if (admins.length === 0) return reply("✅ Aucun admin à retirer.");

  reply(`👑 Suppression de ${admins.length} admins sauf bot et owner...`);

  for (const user of admins) {
    await conn.groupParticipantsUpdate(from, [user.id], "remove")
      .catch(e => console.error(`❌ ${user.id} erreur: ${e.message}`));
  }

  reply("✅ Tous les admins ciblés ont été kick.");
});
