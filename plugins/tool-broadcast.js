const { cmd } = require('../command');
const { sleep } = require('../lib/functions');
const config = require('../config');
                    

cmd({
  pattern: "broadcast",
  alias: ["bcgc"],
  desc: "Broadcast a message to all groups (owner only)",
  category: "owner",
  react: "📢",
  filename: __filename
}, async (conn, m, msg, { text, prefix, command, isCreator, reply, isOwner }) => {
  try {
    if (!isCreator && !isOwner) return reply("❌ *ᴏɴʟʏ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.*");

    if (!text) return reply(`❗ *ᴘʟᴇᴀsᴇ ᴇɴᴛᴇʀ ᴀ ᴍᴇssᴀɢᴇ ᴛᴏ ʙʀᴏᴀᴅᴄᴀsᴛ.*\n\nExample: ${prefix + command} ʜᴇʟʟᴏ ᴇᴠᴇʀʏᴏɴᴇ!`);

    const groupsData = await conn.groupFetchAllParticipating();
    const groups = Object.entries(groupsData).map(entry => entry[1]);
    const groupJids = groups.map(group => group.id);

    reply(`📢 sᴇɴᴅɪɴɢ ʙʀᴏᴀᴅᴄᴀsᴛ ᴛᴏ *${groupJids.length}* ɢʀᴏᴜᴘs...\n⏳ ᴇsᴛɪᴍᴀᴛᴇᴅ ᴛɪᴍᴇ: ~${(groupJids.length * 1.5).toFixed(1)} seconds`);

    for (const jid of groupJids) {
      await sleep(1500);

      const message = `\`\`\`\n${text}\n\`\`\`\n\n_ʙʀᴏᴀᴅᴄᴀsᴛ ғʀᴏᴍ ᴏᴡɴᴇʀ_`;

      await conn.sendMessage(jid, {
        text: message,
        contextInfo: {
          externalAdReply: {
            showAdAttribution: true,
            title: 'ʙʀᴏᴀᴅᴄᴀsᴛ ʙʏ ᴏᴡɴᴇʀ',
            body: `To ${groupJids.length} groups`,
            mediaType: 1,
            thumbnailUrl: config.MENU_IMAGE_URL,
            sourceUrl: global.link,
            renderLargerThumbnail: true
          }
        }
      });
    }

    reply(`✅ *ʙʀᴏᴀᴅᴄᴀsᴛ sᴇɴᴛ ᴛᴏ ${groupJids.length} ɢʀᴏᴜᴘs sᴜᴄᴄᴇssғᴜʟʟʏ.*`);
  } catch (e) {
    console.error(e);
    reply("❌ *An error occurred while broadcasting.*");
  }
});


// Broadcast pv


cmd({
  pattern: "bcpv",
  alias: ["broadcastpv"],
  desc: "Broadcast message to all private chats (owner only)",
  category: "owner",
  react: "📢",
  filename: __filename
}, async (conn, m, msg, { text, prefix, command, isCreator, reply, isOwner }) => {
  try {
    if (!isCreator && !isOwner) return reply("❌ *ᴏɴʟʏ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.*");

    if (!text) return reply(`❗ *ᴘʟᴇᴀsᴇ ᴇɴᴛᴇʀ ᴀ ᴍᴇssᴀɢᴇ ᴛᴏ ʙʀᴏᴀᴅᴄᴀsᴛ.*\n\nExample: ${prefix + command} ʜᴇʟʟᴏ ᴇᴠᴇʀʏᴏɴᴇ!`);

    const allChats = await conn.chats.all();
    const privates = allChats.filter(chat => chat.id.endsWith('@s.whatsapp.net') && !chat.id.includes('-'));

    reply(`📢 sᴇɴᴅɪɴɢ ʙʀᴏᴀᴅᴄᴀsᴛ ᴛᴏ *${privates.length}* ᴘʀɪᴠᴀᴛᴇ ᴄʜᴀᴛs...\n⏳ ᴇsᴛɪᴍᴀᴛᴇᴅ ᴛɪᴍᴇ: ~${(privates.length * 1.2).toFixed(1)} seconds`);

    const start = Date.now();

    for (const chat of privates) {
      await sleep(1200);

      const message = `\`\`\`\n${text}\n\`\`\`\n\n_ʙʀᴏᴀᴅᴄᴀsᴛ ғʀᴏᴍ ᴏᴡɴᴇʀ_`;

      await conn.sendMessage(chat.id, {
        text: message,
        contextInfo: {
          externalAdReply: {
            showAdAttribution: true,
            title: 'ʙʀᴏᴀᴅᴄᴀsᴛ ʙʏ ᴏᴡɴᴇʀ',
            body: `sᴇɴᴛ ᴛᴏ ${privates.length} ᴘʀɪᴠᴀᴛᴇ ᴄʜᴀᴛs`,
            mediaType: 1,
            thumbnailUrl: config.MENU_IMAGE_URL,
            sourceUrl: global.link,
            renderLargerThumbnail: true
          }
        }
      });
    }

    const end = ((Date.now() - start) / 1000).toFixed(1);
    reply(`✅ *ʙʀᴏᴀᴅᴄᴀsᴛ sᴇɴᴛ ᴛᴏ ${privates.length} ᴘʀɪᴠᴀᴛᴇ ᴜsᴇʀs sᴜᴄᴄᴇssғᴜʟʟʏ ɪɴ ${end}s.*`);
  } catch (e) {
    console.error(e);
    reply("❌ *An error occurred while broadcasting.*");
  }
});
