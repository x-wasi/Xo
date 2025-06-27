const { cmd } = require('../command');
const config = require("../config");

cmd({
  on: "body"
}, async (conn, m, store, {
  from,
  body,
  sender,
  isGroup,
  isAdmins,
  isBotAdmins,
  reply
}) => {
  try {
    // Initialize warnings if not already
    if (!global.warnings) global.warnings = {};

    // Only work in groups, if sender is not admin, and bot is admin
    if (!isGroup || isAdmins || !isBotAdmins) return;

    // Check if the message contains mass mentions (status tagging)
    const contextInfo = m.message?.extendedTextMessage?.contextInfo || m.message?.conversationContextInfo || {};
    const mentioned = contextInfo?.mentionedJid || [];

    // Detect status tag spam (e.g., tagging many members)
    const isStatusMention = mentioned.length > 5 || (body.includes("@") && mentioned.length > 0);

    if (isStatusMention && config.ANTI_MENTION_STATUS === "true") {
      console.log(`[⚠️] sᴛᴀᴛᴜs ᴍᴇɴᴛɪᴏɴ ᴅᴇᴛᴇᴄᴛᴇᴅ ғʀᴏᴍ ${sender}`);

      // Attempt to delete the message
      try {
        await conn.sendMessage(from, { delete: m.key });
        console.log(`Message deleted: ${m.key.id}`);
      } catch (err) {
        console.error("Failed to delete message:", err);
      }

      // Add warning to sender
      global.warnings[sender] = (global.warnings[sender] || 0) + 1;
      const warns = global.warnings[sender];

      if (warns < 4) {
        // Send warning message
        await conn.sendMessage(from, {
          text: `*🚫 sᴛᴀᴛᴜs ᴛᴀɢɢɪɴɢ ɪs ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ!*\n` +
                `*╭── ⚠️ ᴡᴀʀɴɪɴɢ ⚠️ ──╮*\n` +
                `*├▢ ᴜsᴇʀ:* @${sender.split('@')[0]}\n` +
                `*├▢ ᴡᴀʀɴ COUNT:* ${warns}\n` +
                `*├▢ ʀᴇᴀsᴏɴ:* ᴍᴀss ᴍᴇɴᴛɪᴏɴ (sᴛᴀᴛᴜs ᴛᴀɢ)\n` +
                `*├▢ ʟɪᴍɪᴛ:* 4\n` +
                `*╰────────────────────*`,
          mentions: [sender]
        });
      } else {
        // Kick the user after 3 warnings
        await conn.sendMessage(from, {
          text: `@${sender.split('@')[0]} *ʜᴀs ʙᴇᴇɴ ʀᴇᴍᴏᴠᴇᴅ ғᴏʀ ᴇxᴄᴇssɪᴠᴇ sᴛᴀᴛᴜs ᴛᴀɢɢɪɴɢ!*`,
          mentions: [sender]
        });
        await conn.groupParticipantsUpdate(from, [sender], "remove");
        delete global.warnings[sender]; // Reset warnings
      }
    }

  } catch (err) {
    console.error("Anti-status-mention error:", err);
    reply("❌ An error occurred in the anti-mention-status system.");
  }
});
