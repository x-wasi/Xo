const { cmd } = require("../command");

// In-memory settings
const antiMentionSettings = new Map(); // {groupId: mode}
const warnCounter = new Map();         // {groupId:userId => count}

// 🔒 Enable command
cmd({
  pattern: "antigpmention",
  alias: ["agm"],
  desc: "Anti group status mention (warn, remove, counter)",
  react: "🔒",
  category: "group",
  filename: __filename
}, async (conn, m, store, { args, isAdmin, metadata, reply }) => {
  if (!metadata || !isAdmin) {
    return reply("❌ Only group admins can use this command.");
  }

  const mode = (args[0] || "").toLowerCase();
  if (!["warn", "remove", "counter"].includes(mode)) {
    return reply("⚠️ Usage: .antigpmention [warn|remove|counter]");
  }

  antiMentionSettings.set(m.chat, mode);
  return reply(`✅ Anti group mention has been enabled in *${mode.toUpperCase()}* mode.`);
});

// ❌ Disable command
cmd({
  pattern: "antimsoff",
  desc: "Disable anti group status mention",
  react: "❌",
  category: "group",
  filename: __filename
}, async (conn, m, store, { isAdmin, metadata, reply }) => {
  if (!metadata || !isAdmin) return reply("❌ Only group admins can disable this.");
  antiMentionSettings.delete(m.chat);
  return reply("🚫 Anti group mention has been *disabled*.");
});

// 👁️ Message monitor
cmd({
  on: "messages.upsert",
  filename: __filename
}, async (conn, m, store, extras) => {
  try {
    const { ms, verifGroupe, auteurMessage, verifAdmin, superUser } = extras;

    if (!verifGroupe) return;
    if (!ms?.message?.groupStatusMentionMessage) return;
    if (verifAdmin || ms.key.fromMe || superUser) return;

    const mode = antiMentionSettings.get(m.chat);
    if (!mode) return;

    const sender = auteurMessage;
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
          text: `⚠️ @${sender.split("@")[0]}, please avoid sending group status mentions.`,
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

  } catch (e) {
    console.error("❌ AntiGPMention Error:", e);
  }
});
