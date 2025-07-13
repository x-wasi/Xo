const config = require('../config')
const { cmd } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('../lib/functions')

cmd({
    pattern: "revoke",
    react: "🖇️",
    alias: ["revokegrouplink", "resetglink", "revokelink", "f_revoke"],
    desc: "To Reset the group link",
    category: "group",
    use: '.revoke',
    filename: __filename
},
async (conn, mek, m, {
    from, isCmd, isGroup, sender, isBotAdmins,
    isAdmins, reply
}) => {
    try {
        if (!isGroup) return reply(`❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴏɴʟʏ ᴡᴏʀᴋs ɪɴ ɢʀᴏᴜᴘs.`);
        if (!isAdmins) return reply(`⛔ ʏᴏᴜ ᴍᴜsᴛ ʙᴇ ᴀ *ɢʀᴏᴜᴘ ᴀᴅᴍɪɴ* ᴛᴏ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.`);
        if (!isBotAdmins) return reply(`❌ I ɴᴇᴇᴅ ᴛᴏ ʙᴇ *ᴀᴅᴍɪɴ* ᴛᴏ ʀᴇsᴇᴛ ᴛʜᴇ ɢʀᴏᴜᴘ ʟɪɴᴋ.`);

        await conn.groupRevokeInvite(from);
        await conn.sendMessage(from, {
            text: `✅ *ɢʀᴏᴜᴘ ʟɪɴᴋ ʜᴀs ʙᴇᴇɴ ʀᴇsᴇᴛ sᴜᴄᴄᴇssғᴜʟʟʏ!*`
        }, { quoted: mek });

    } catch (err) {
        console.error(err);
        reply(`❌ Error resetting group link.`);
    }
});
