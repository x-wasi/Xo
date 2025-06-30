const config = require("../config");
const { cmd, commands } = require("../command");
const { downloadContentFromMessage } = require("baileys");

// Helper function to convert a stream to a Buffer.
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

cmd(
  {
    pattern: "add",
    desc: "Adds a person to group",
    category: "group",
    filename: __filename,
  },
  async (conn, mek, m, { from, quoted, args, reply, isGroup, isBotAdmins }) => {
    try {
      if (!isGroup) return reply("_ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ғᴏʀ ɢʀᴏᴜᴘs_");
      if (!isBotAdmins) return reply("_ɪ'ᴍ ɴᴏᴛ ᴀᴅᴍɪɴ_");
      if (!args[0] && !quoted) return reply("_ᴍᴇɴᴛɪᴏɴ ᴜsᴇʀ ᴛᴏ ᴀᴅᴅ_");

      let jid = m.mentionedJid?.[0] 
            || (m.quoted?.sender ?? null)
            || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net");
            
      await conn.groupParticipantsUpdate(from, [jid], "add");
      return reply(`@${jid.split("@")[0]} added`, { mentions: [jid] });
    } catch (e) {
      console.log(e);
      m.reply(`${e}`);
    }
  }
);

cmd(
  {
    pattern: "promote",
    desc: "Promotes a member",
    category: "group",
    filename: __filename,
  },
  async (conn, mek, m, { from, quoted, args, reply, isGroup, isBotAdmins }) => {
    try {
      if (!isGroup) return reply("_This command is for groups_");
      if (!isBotAdmins) return reply("_I'm not admin_");
      if (!args[0] && !quoted) return reply("_ᴍᴇɴᴛɪᴏɴ ᴜsᴇʀ ᴛᴏ ᴘʀᴏᴍᴏᴛᴇ_");

      let jid = m.mentionedJid?.[0] 
            || (m.quoted?.sender ?? null)
            || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net");
      await conn.groupParticipantsUpdate(from, [jid], "promote");
      return reply(`@${jid.split("@")[0]} ᴘʀᴏᴍᴏᴛᴇᴅ ᴀs ᴀᴅᴍɪɴ`, { mentions: [jid] });
    } catch (e) {
      console.log(e);
      m.reply(`${e}`);
    }
  }
);

cmd(
  {
    pattern: "demote",
    desc: "Demotes a member",
    category: "group",
    filename: __filename,
  },
  async (conn, mek, m, { from, quoted, args, reply, isGroup, isBotAdmins }) => {
    try {
      if (!isGroup) return reply("_ᴛʜɪs command ɪs ғᴏʀ ɢʀᴏᴜᴘs_");
      if (!isBotAdmins) return reply("_ɪ'ᴍ ɴᴏᴛ ᴀᴅᴍɪɴ_");
      if (!args[0] && !quoted) return reply("_ᴍᴇɴᴛɪᴏɴ ᴜsᴇʀ ᴛᴏ ᴅᴇᴍᴏᴛᴇ_");

      let jid = m.mentionedJid?.[0] 
            || (m.quoted?.sender ?? null)
            || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net");
            
      await conn.groupParticipantsUpdate(from, [jid], "demote");
      return reply(`@${jid.split("@")[0]} ᴅᴇᴍᴏᴛᴇᴅ ғʀᴏᴍ ᴀᴅᴍɪɴ`, { mentions: [jid] });
    } catch (e) {
      console.log(e);
      m.reply(`${e}`);
    }
  }
);
