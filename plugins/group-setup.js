const { cmd } = require('../command');

cmd({
    pattern: "promote",
    alias: ["p", "makeadmin"],
    desc: "Promotes a member to group admin",
    category: "group",
    react: "⬆️",
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, q, isGroup, isAdmins, isBotAdmins,
    groupMetadata, participants, groupAdmins, botNumber, reply
}) => {

    if (!isGroup) return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴏɴʟʏ ᴡᴏʀᴋs ɪɴ ɢʀᴏᴜᴘs.");
    if (!isAdmins) return reply("❌ ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴘʀᴏᴍᴏᴛᴇ ᴍᴇᴍʙᴇʀs.");
    if (!isBotAdmins) return reply("❌ ɪ ɴᴇᴇᴅ ᴛᴏ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ᴅᴏ ᴛʜᴀᴛ.");

    let number;
    if (m.quoted) {
        number = m.quoted.sender.split("@")[0];
    } else if (q && q.includes("@")) {
        number = q.replace(/[@\s+]/g, "");
    } else {
        return reply("❌ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ ᴏʀ ᴍᴇɴᴛɪᴏɴ ᴏɴᴇ ᴛᴏ ᴘʀᴏᴍᴏᴛᴇ.");
    }

    if (number === botNumber) return reply("❌ ɪ ᴄᴀɴ'ᴛ ᴘʀᴏᴍᴏᴛᴇ ᴍʏsᴇʟғ.");
    const jid = number + "@s.whatsapp.net";

    const target = participants.find(p => p.id === jid);
    if (!target) return reply(`❌ @${number} ɪs ɴᴏᴛ ɪɴ ᴛʜɪs ɢʀᴏᴜᴘ.`, { mentions: [jid] });

    if (jid === groupMetadata.owner) {
        return reply("⚠️ ᴄᴀɴ'ᴛ ᴘʀᴏᴍᴏᴛᴇ ᴛʜᴇ ɢʀᴏᴜᴘ ᴏᴡɴᴇʀ.");
    }

    if (groupAdmins.includes(jid)) {
        return reply(`⚠️ @${number} ɪs ᴀʟʀᴇᴀᴅʏ ᴀɴ ᴀᴅᴍɪɴ.`, { mentions: [jid] });
    }

    try {
        await conn.groupParticipantsUpdate(from, [jid], "promote");
        reply(`✅ sᴜᴄᴄᴇssғᴜʟʟʏ ᴘʀᴏᴍᴏᴛᴇᴅ @${number} ᴛᴏ ᴀᴅᴍɪɴ.`, { mentions: [jid] });
    } catch (error) {
        console.error("Promote error:", error);
        reply("❌ ғᴀɪʟᴇᴅ ᴛᴏ ᴘʀᴏᴍᴏᴛᴇ ᴛʜᴇ ᴍᴇᴍʙᴇʀ.");
    }
});


cmd({
    pattern: "demote",
    alias: ["d", "dismiss", "removeadmin"],
    desc: "Demotes a group admin to a normal member",
    category: "group",
    react: "⬇️",
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, q, isGroup, isAdmins, isBotAdmins,
    groupMetadata, participants, groupAdmins, botNumber, reply
}) => {

    if (!isGroup) return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴏɴʟʏ ᴡᴏʀᴋs ɪɴ ɢʀᴏᴜᴘs.");
    if (!isAdmins) return reply("❌ ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴅᴇᴍᴏᴛᴇ ᴍᴇᴍʙᴇʀs.");
    if (!isBotAdmins) return reply("❌ ɪ ɴᴇᴇᴅ ᴛᴏ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ᴅᴏ ᴛʜᴀᴛ.");

    let number;
    if (m.quoted) {
        number = m.quoted.sender.split("@")[0];
    } else if (q && q.includes("@")) {
        number = q.replace(/[@\s+]/g, "");
    } else {
        return reply("❌ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ ᴏʀ ᴍᴇɴᴛɪᴏɴ ᴏɴᴇ ᴛᴏ ᴅᴇᴍᴏᴛᴇ.");
    }

    if (number === botNumber) return reply("❌ ɪ ᴄᴀɴ'ᴛ ᴅᴇᴍᴏᴛᴇ ᴍʏsᴇʟғ.");
    const jid = number + "@s.whatsapp.net";

    const target = participants.find(p => p.id === jid);
    if (!target) return reply(`❌ @${number} ɪs ɴᴏᴛ ɪɴ ᴛʜɪs ɢʀᴏᴜᴘ.`, { mentions: [jid] });

    if (jid === groupMetadata.owner) {
        return reply("⚠️ ᴄᴀɴ'ᴛ ᴅᴇᴍᴏᴛᴇ ᴛʜᴇ ɢʀᴏᴜᴘ ᴏᴡɴᴇʀ.");
    }

    if (!groupAdmins.includes(jid)) {
        return reply(`⚠️ @${number} ɪs ɴᴏᴛ ᴀɴ ᴀᴅᴍɪɴ.`, { mentions: [jid] });
    }

    try {
        await conn.groupParticipantsUpdate(from, [jid], "demote");
        reply(`✅ sᴜᴄᴄᴇssғᴜʟʟʏ ᴅᴇᴍᴏᴛᴇᴅ @${number} ᴛᴏ ᴀ ɴᴏʀᴍᴀʟ ᴍᴇᴍʙᴇʀ.`, { mentions: [jid] });
    } catch (error) {
        console.error("Demote error:", error);
        reply("❌ ғᴀɪʟᴇᴅ ᴛᴏ ᴅᴇᴍᴏᴛᴇ ᴛʜᴇ ᴍᴇᴍʙᴇʀ.");
    }
});
