const { cmd } = require('../command');
const { sleep } = require('../lib/functions2');

cmd({
  pattern: "broadcast",
  alias: ["bcgroup", "bc"],
  category: "owner",
  desc: "Send a text/media broadcast to all groups",
  filename: __filename,
  use: "<text or reply to a media>"
}, async (conn, message, m, { q, isOwner, reply }) => {
  try {
    if (!isOwner) return reply("❌ ᴏɴʟʏ ᴛʜᴇ *ʙᴏᴛ ᴏᴡɴᴇʀ* ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
    if (!q && !message.quoted) return reply("❌ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴛᴇxᴛ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴀɴ ɪᴍᴀɢᴇ/ᴠɪᴅᴇᴏ!");

    const groupsData = await conn.groupFetchAllParticipating();
    const groupIds = Object.keys(groupsData);
    const failed = [];

    reply(`📣 ʙʀᴏᴀᴅᴄᴀsᴛɪɴɢ ᴛᴏ *${groupIds.length}* ɢʀᴏᴜᴘs...\n⏳ ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ ᴀ ᴍᴏᴍᴇɴᴛ.`);

    for (const groupId of groupIds) {
      try {
        await sleep(1500);

        if (message.quoted && message.quoted.mtype?.includes("image")) {
          const buffer = await message.quoted.download();
          await conn.sendMessage(groupId, {
            image: buffer,
            caption: q || '',
          });
        } else if (message.quoted && message.quoted.mtype?.includes("video")) {
          const buffer = await message.quoted.download();
          await conn.sendMessage(groupId, {
            video: buffer,
            caption: q || '',
          });
        } else {
          await conn.sendMessage(groupId, {
            text: `*📢 ʙʀᴏᴀᴅᴄᴀsᴛ:*\n\n${q}`
          });
        }

      } catch (err) {
        failed.push(groupId);
        console.error(`❌ Error with ${groupId}:`, err.message);
      }
    }

    reply(`✅ ʙʀᴏᴀᴅᴄᴀsᴛ ғɪɴɪsʜᴇᴅ.\n\n*sᴜᴄᴄᴇss:* ${groupIds.length - failed.length}\n*ғᴀɪʟᴇᴅ:* ${failed.length}${failed.length > 0 ? `\n\nғᴀɪʟᴇᴅ ɢʀᴏᴜᴘs:\n${failed.join("\n")}` : ""}`);

  } catch (err) {
    console.error("Broadcast Error:", err);
    await m.error(`❌ Error: ${err.message}`, err);
  }
});
