const { cmd } = require('../command');

const { getBuffer } = require('../lib/functions');

cmd({

    pattern: "getpp",

    alias: ["pp", "profilepic"],

    use: ".getpp @user",

    desc: "Get someone's profile picture",

    category: "user",

    react: "🖼️",

    filename: __filename

},

async (conn, mek, m, { from, sender, reply }) => {

    try {

        let targetUser;

        if (m.quoted) {

            targetUser = m.quoted.sender;

        } else if (m.mentionedJid && m.mentionedJid.length > 0) {

            targetUser = m.mentionedJid[0];

        } else {

            return reply(`🖼️ ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴍᴇssᴀɢᴇ ᴏʀ ᴍᴇɴᴛɪᴏɴ ᴀ ᴜsᴇʀ ᴛᴏ ɢᴇᴛ ᴛʜᴇɪʀ ᴘʀᴏғɪʟᴇ ᴘɪᴄᴛᴜʀᴇ.`);

        }

        // Récupère la photo de profil

        const profilePic = await conn.profilePictureUrl(targetUser, 'image').catch(() => null);

        if (!profilePic) {

            return reply("❌ Couldn't fetch profile picture. The user might not have one.");

        }

        const caption = `💫 ᴘʀᴏғɪʟᴇ ᴘɪᴄᴛᴜʀᴇ ᴏғ @${targetUser.split('@')[0]}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*`;

        await conn.sendMessage(from, {

            image: { url: profilePic },

            caption,

            mentions: [targetUser],

            contextInfo: {

                mentionedJid: [targetUser],

                forwardingScore: 999,

                isForwarded: false

            }

        }, { quoted: mek });

    } catch (err) {

        console.error("❌ GETPP ERROR:", err);

        reply("❌ Error while getting profile picture.");

    }

});
