const { cmd } = require("../command");

cmd({
  pattern: "cid",
  alias: ["newsletter", "id"],
  react: "📡",
  desc: "Get WhatsApp Channel info from link",
  category: "whatsapp",
  filename: __filename
}, async (conn, mek, m, {
  from,
  args,
  q,
  reply
}) => {
  try {
    if (!q) return reply("📛 ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴡʜᴀᴛsᴀᴘᴘ ᴄʜᴀɴɴᴇʟ ʟɪɴᴋ.\n\n*ᴇxᴀᴍᴘʟᴇ:* .ᴄɪᴅ https://whatsapp.com/channel/123456789");

    const match = q.match(/whatsapp\.com\/channel\/([\w-]+)/);
    if (!match) return reply("⚠️ *ɪɴᴠᴀʟɪᴅ ᴄʜᴀɴɴᴇʟ ʟɪɴᴋ ғᴏʀᴍᴀᴛ.*\n\nMake sᴜʀᴇ ɪᴛ ʟᴏᴏᴋs ʟɪᴋᴇ:\nhttps://whatsapp.com/channel/xxxxxxxxx");

    const inviteId = match[1];

    let metadata;
    try {
      metadata = await conn.newsletterMetadata("invite", inviteId);
    } catch (e) {
      return reply("❌ ғᴀɪʟᴇᴅ ᴛᴏ ғᴇᴛᴄʜ ᴄʜᴀɴɴᴇʟ ᴍᴇᴛᴀᴅᴀᴛᴀ. ᴍᴀᴋᴇ sᴜʀᴇ ᴛʜᴇ ʟɪɴᴋ ɪs ᴄᴏʀʀᴇᴄᴛ.");
    }

    if (!metadata || !metadata.id) return reply("❌ ᴄʜᴀɴɴᴇʟ ɴᴏᴛ ғᴏᴜɴᴅ ᴏʀ ɪɴᴀᴄᴄᴇssɪʙʟᴇ.");

    const infoText = `*— 乂 ᴄʜᴀɴɴᴇʟ ɪɴғᴏ —*\n\n` +
      `🆔 *ɪᴅ:* ${metadata.id}\n` +
      `📌 *ɴᴀᴍᴇ:* ${metadata.name}\n` +
      `👥 *ғᴏʟʟᴏᴡᴇʀs:* ${metadata.subscribers?.toLocaleString() || "N/A"}\n` +
      `📅 *ᴄʀᴇᴀᴛᴇᴅ ᴏɴ:* ${metadata.creation_time ? new Date(metadata.creation_time * 1000).toLocaleString("id-ID") : "Unknown"}`;

    if (metadata.preview) {
      await conn.sendMessage(from, {
        image: { url: `https://pps.whatsapp.net${metadata.preview}` },
        caption: infoText
      }, { quoted: m });
    } else {
      await reply(infoText);
    }

  } catch (error) {
    console.error("❌ Error in .cinfo plugin:", error);
    reply("⚠️ An unexpected error occurred.");
  }
});
