const { cmd } = require('../command');


cmd({
  pattern: "kickall",
  desc: "Kick all non-admin members from the group.",
  category: "group",
  filename: __filename,
  react: "🔨",
  fromMe: true
}, async (conn, mek, m, { from, isGroup, isBotAdmins, isAdmins, reply }) => {
  if (!isGroup) return reply("*This command can only be used in groups*.");
  if (!isAdmins) return reply("*Only group admins can use this command*.");
  if (!isBotAdmins) return reply("*I need to be admin to perform this action*.");

  try {
    const metadata = await conn.groupMetadata(from);
    const nonAdmins = metadata.participants.filter(p => p.admin === null).map(p => p.id);

    if (nonAdmins.length === 0) return reply("*There are no non-admin members to kick.*");

    await reply(`⚠️ Starting to remove ${nonAdmins.length} non-admin members...`);

    for (const userId of nonAdmins) {
      await conn.groupParticipantsUpdate(from, [userId], "remove");
      await new Promise(r => setTimeout(r, 200)); // 5 kicks/sec
    }

    await reply(`✅ Successfully removed ${nonAdmins.length} non-admin members.`);
  } catch (error) {
    console.error("kickall error:", error);
    reply("*Failed to remove members. Make sure I have all required permissions.*");
  }
});

cmd({
  pattern: "kickalladmin",
  desc: "Kick all admins except the bot itself.",
  category: "group",
  filename: __filename,
  react: "⚠️",
  fromMe: true
}, async (conn, mek, m, { from, isGroup, isBotAdmins, isAdmins, reply }) => {
  if (!isGroup) return reply("*This command can only be used in groups*.");
  if (!isAdmins) return reply("*Only group admins can use this command*.");
  if (!isBotAdmins) return reply("*I need to be admin to perform this action*.");

  try {
    const metadata = await conn.groupMetadata(from);
    const admins = metadata.participants.filter(p => p.admin !== null).map(p => p.id);
    const botId = conn.user.id.split(":")[0] + "@s.whatsapp.net";

    const adminsToKick = admins.filter(id => id !== botId);
    if (adminsToKick.length === 0) return reply("*No other admins to kick in this group.*");

    await reply(`⚠️ Starting to remove ${adminsToKick.length} admins...`);

    for (const userId of adminsToKick) {
      await conn.groupParticipantsUpdate(from, [userId], "remove");
      await new Promise(r => setTimeout(r, 1000)); // 1 kick/sec to avoid blocks
    }

    await reply(`✅ Successfully removed ${adminsToKick.length} admins.`);
  } catch (error) {
    console.error("kickalladmin error:", error);
    reply("*Failed to remove admins. Make sure I have all required permissions.*");
  }
});
