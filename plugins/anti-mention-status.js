const { cmd } = require('../command');
const config = require("../config");

cmd({
  on: "message"
}, async (conn, m, store, {
  from,
  sender,
  isGroup,
  isAdmins,
  isBotAdmins,
  reply
}) => {
  try {
    if (!isGroup || isAdmins || !isBotAdmins) return;

    if (config.ANTI_MENTION_STATUS !== "true") return;

    const msg = m.message;

    // Detect status mention (e.g. "Statut de +xxx", group mentioned)
    const isStatusMention =
      msg?.extendedTextMessage?.text?.includes("Statut de") ||
      msg?.extendedTextMessage?.canonicalUrl?.includes("status") ||
      msg?.messageStubType === 22 || // Group mention via status
      m.pushName?.toLowerCase().includes("statut");

    if (isStatusMention) {
      await conn.sendMessage(from, { delete: m.key });

      // Warn system
      global.warnings = global.warnings || {};
      global.warnings[sender] = (global.warnings[sender] || 0) + 1;
      const warn = global.warnings[sender];

      if (warn < 4) {
        await conn.sendMessage(from, {
          text: `⚠️ *Status Mention Detected!*\nUser: @${sender.split("@")[0]}\nWarnings: ${warn}/3`,
          mentions: [sender]
        });
      } else {
        await conn.sendMessage(from, {
          text: `@${sender.split('@')[0]} has been *removed* for status mention spam!`,
          mentions: [sender]
        });
        await conn.groupParticipantsUpdate(from, [sender], "remove");
        delete global.warnings[sender];
      }
    }
  } catch (err) {
    console.error("❌ Anti-status error:", err);
    reply("An error occurred in anti-status plugin.");
  }
});
