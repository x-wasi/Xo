const { cmd } = require('../command');
const config = require('../config');
const { getBuffer } = require('../lib/functions2');
const prefix = config.PREFIX;

cmd({
    pattern: "linkgroup",
    alias: ["link", "invite", "grouplink", "linkgc"],
    desc: "Get group invite link.",
    category: "group",
    filename: __filename,
}, async (conn, mek, m, {
    from, quoted, isGroup, sender, reply
}) => {
    try {
        if (!isGroup) return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs.");

        const senderNumber = sender.split('@')[0];
        const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';

        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants || [];

        const groupAdmins = participants.filter(p => p.admin);
        const isBotAdmin = groupAdmins.some(p => p.id === botNumber);
        const isSenderAdmin = groupAdmins.some(p => p.id === sender);

        if (!isBotAdmin) return reply("❌ ɪ ɴᴇᴇᴅ ᴛᴏ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ɢᴇᴛ ᴛʜᴇ ɢʀᴏᴜᴘ ʟɪɴᴋ.");
        if (!isSenderAdmin) return reply("❌ ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");

        const inviteCode = await conn.groupInviteCode(from);
        if (!inviteCode) return reply("❌ ᴄᴏᴜʟᴅɴ'ᴛ ꜰᴇᴛᴄʜ ᴛʜᴇ ɪɴᴠɪᴛᴇ ᴄᴏᴅᴇ.");

        const groupLink = `https://chat.whatsapp.com/${inviteCode}`;
        const groupName = groupMetadata.subject || "ᴜɴᴋɴᴏᴡɴ";
        const groupOwner = groupMetadata.owner ? '@' + groupMetadata.owner.split('@')[0] : "ᴜɴᴋɴᴏᴡɴ";
        const groupId = groupMetadata.id || from;
        const memberCount = participants.length;

        const caption = `
╭──〔 *𝙶𝚁𝙾𝚄𝙿 𝙻𝙸𝙽𝙺* 〕──⬣
┃ 📍 *ɴᴀᴍᴇ:*  ${groupName}
┃ 👑 *ᴏᴡɴᴇʀ:* ${groupOwner}
┃ 🆔 *ɪᴅ:* ${groupId}
┃ 🔗 *ɪɴᴠɪᴛᴇ ʟɪɴᴋ:* ${groupLink}
┃ 👥 *ᴍᴇᴍʙᴇʀs:* ${memberCount}
╰──────────────⬣

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*
        `.trim();

        let ppUrl = 'https://telegra.ph/file/6880771a42bad09dd6087.jpg';
        try {
            ppUrl = await conn.profilePictureUrl(from, 'image');
        } catch (e) { }

        const buffer = await getBuffer(ppUrl);
        return conn.sendMessage(from, {
            image: buffer,
            caption,
            mentions: [groupMetadata.owner]
        }, { quoted: m });

    } catch (err) {
        console.error("❌ Error in .linkgroup:", err);
        return reply(`⚠️ ᴀɴ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ: ${err.message || 'ᴜɴᴋɴᴏᴡɴ ᴇʀʀᴏʀ'}`);
    }
});
