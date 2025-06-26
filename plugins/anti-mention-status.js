const { cmd } = require('../command')

const antiMentionSettings = new Map() // Stores: groupId -> mode
const warnCounter = new Map()         // Stores: groupId:userId -> count

// Enable Anti Mention
cmd({
  pattern: "antigpmention",
  alias: ["agpm"],
  desc: "Enable anti group status mention system (warn, remove, counter).",
  react: "🔒",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, args, reply }) => {
  try {
    if (!isGroup) return reply("❌ This command can only be used in groups.");
    if (!isAdmins) return reply("❌ Only group admins can use this command.");

    const mode = (args[0] || "").toLowerCase();
    if (!["warn", "remove", "counter"].includes(mode)) {
      return reply("⚠️ Usage: .antigpmention [warn|remove|counter]");
    }

    antiMentionSettings.set(from, mode);
    reply(`✅ Anti group mention system enabled in *${mode.toUpperCase()}* mode.`);
  } catch (e) {
    console.error("Error enabling AntiGPMention:", e);
    reply("❌ Failed to enable anti group mention system.");
  }
});

// Disable Anti Mention
cmd({
  pattern: "agpmoff",
  desc: "Disable anti group status mention system.",
  react: "❌",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, reply }) => {
  try {
    if (!isGroup) return reply("❌ This command can only be used in groups.");
    if (!isAdmins) return reply("❌ Only group admins can disable the system.");

    antiMentionSettings.delete(from);
    reply("🚫 Anti group mention system has been disabled.");
  } catch (e) {
    console.error("Error disabling AntiGPMention:", e);
    reply("❌ Failed to disable anti group mention system.");
  }
});

// Monitor groupStatusMentionMessage
cmd({
  on: "messages.upsert",
  filename: __filename
}, async (conn, m, store, { ms, isGroup, sender, isAdmins }) => {
  try {
    if (!isGroup || !ms?.message?.groupStatusMentionMessage) return;
    if (isAdmins || ms.key.fromMe) return;

    const mode = antiMentionSettings.get(m.chat);
    if (!mode) return;

    const keyMsg = {
      remoteJid: m.chat,
      fromMe: false,
      id: ms.key.id,
      participant: sender
    };

    switch (mode) {
      case "remove":
        await conn.groupParticipantsUpdate(m.chat, [sender], "remove");
        await conn.sendMessage(m.chat, { delete: keyMsg });
        await conn.sendMessage(m.chat, {
          text: `⛔ @${sender.split("@")[0]} has been removed from the group.`,
          mentions: [sender]
        });
        break;

      case "warn":
        await conn.sendMessage(m.chat, { delete: keyMsg });
        await conn.sendMessage(m.chat, {
          text: `⚠️ @${sender.split("@")[0]} please do not send group status mentions.`,
          mentions: [sender]
        });
        break;

      case "counter":
        const key = `${m.chat}:${sender}`;
        const warns = (warnCounter.get(key) || 0) + 1;
        warnCounter.set(key, warns);
        const max = 3;

        if (warns >= max) {
          await conn.sendMessage(m.chat, {
            text: `⛔ @${sender.split("@")[0]} has been removed after ${max} warnings.`,
            mentions: [sender]
          });
          await conn.groupParticipantsUpdate(m.chat, [sender], "remove");
          await conn.sendMessage(m.chat, { delete: keyMsg });
          warnCounter.delete(key);
        } else {
          await conn.sendMessage(m.chat, {
            text: `⚠️ @${sender.split("@")[0]} warning ${warns}/${max}`,
            mentions: [sender]
          });
          await conn.sendMessage(m.chat, { delete: keyMsg });
        }
        break;
    }
  } catch (err) {
    console.error("AntiGPMention error:", err);
  }
});
