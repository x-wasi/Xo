const { cmd } = require('../command');

cmd({
    pattern: "jid",
    alias: ["id", "chatid", "gjid"],  
    desc: "Get full JID of current chat/user (Creator Only)",
    react: "🆔",
    category: "utility",
    filename: __filename,
}, async (conn, mek, m, { 
    from, isGroup, isCreator, reply, sender 
}) => {
    try {
        if (!isCreator) {
            return reply("❌ *ᴄᴏᴍᴍᴀɴᴅ ʀᴇsᴛʀɪᴄᴛᴇᴅ* - ᴏɴʟʏ ᴍʏ ᴄʀᴇᴀᴛᴏʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs.");
        }

        if (isGroup) {
            // Ensure group JID ends with @g.us
            const groupJID = from.includes('@g.us') ? from : `${from}@g.us`;
            return reply(`👥 *ɢʀᴏᴜᴘ ᴊɪᴅ:*\n\`\`\`${groupJID}\`\`\``);
        } else {
            // Ensure user JID ends with @s.whatsapp.net
            const userJID = sender.includes('@s.whatsapp.net') ? sender : `${sender}@s.whatsapp.net`;
            return reply(`👤 *ᴜsᴇʀ ᴊɪᴅ:*\n\`\`\`${userJID}\`\`\``);
        }

    } catch (e) {
        console.error("JID Error:", e);
        reply(`⚠️ Error fetching JID:\n${e.message}`);
    }
});
