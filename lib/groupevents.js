// Credits DybyTech - MEGALODON-MD 💜 
// https://whatsapp.com/channel/0029VbAdcIXJP216dKW1253g

const { isJidGroup } = require('baileys');
const config = require('../config');

const fallbackPP = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';

const getContextInfo = (m) => ({
    mentionedJid: [m.sender],
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363401051937059@newsletter',
        newsletterName: '𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃',
        serverMessageId: 143,
    },
});

const GroupEvents = async (conn, update) => {
    try {
        if (!isJidGroup(update.id) || !Array.isArray(update.participants)) return;

        const metadata = await conn.groupMetadata(update.id);
        const groupName = metadata.subject;
        const groupDesc = metadata.desc || 'No description available.';
        const memberCount = metadata.participants.length;

        let groupPP;
        try {
            groupPP = await conn.profilePictureUrl(update.id, 'image');
        } catch {
            groupPP = fallbackPP;
        }

        for (const user of update.participants) {
            const username = user.split('@')[0];
            const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const date = new Date().toLocaleDateString('en-US');
            let userPP;

            try {
                userPP = await conn.profilePictureUrl(user, 'image');
            } catch {
                userPP = groupPP;
            }

            const sendMessage = async (caption, image = false, mentions = [user]) => {
                const msg = {
                    caption,
                    mentions,
                    contextInfo: getContextInfo({ sender: user }),
                };
                if (image) msg.image = { url: userPP };
                else msg.text = caption;
                await conn.sendMessage(update.id, msg);
            };

            if (update.action === 'add' && config.WELCOME === 'true') {
                const welcome = 
`┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃  👋 𝐍𝐄𝐖 𝐌𝐄𝐌𝐁𝐄𝐑 𝐉𝐎𝐈𝐍𝐄𝐃  🎉
┣━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 🧑‍💼 User: @${username}
┃ 📅 Joined: ${date} ⏰ ${time}
┃ 👥 Members: ${memberCount}
┃ 🏷️ Group: ${groupName}
┣━━━━━━━━━━━━━━━━━━━━━━━
┃ 📌 Description:
┃ ${groupDesc}
┗━━━━━━━━━━━━━━━━━━━━━━━┛`;

                await sendMessage(welcome, true);

            } else if (update.action === 'remove' && config.WELCOME === 'true') {
                const goodbye = 
`┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃  👋 𝐌𝐄𝐌𝐁𝐄𝐑 𝐋𝐄𝐅𝐓  😢
┣━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 🧑‍💼 User: @${username}
┃ 📅 Left at: ${date} ⏰ ${time}
┃ 👥 Remaining: ${memberCount}
┗━━━━━━━━━━━━━━━━━━━━━━━┛`;

                await sendMessage(goodbye, true);

            } else if (update.action === 'promote' && config.ADMIN_EVENTS === 'true') {
                const promoter = update.author ? update.author.split('@')[0] : 'Unknown';
                const promoteMsg = 
`┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🔺 𝐔𝐒𝐄𝐑 𝐏𝐑𝐎𝐌𝐎𝐓𝐄𝐃 🎖️
┣━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 🧑‍💼 Promoted: @${username}
┃ 👑 By: @${promoter}
┃ 🕒 Time: ${time}
┗━━━━━━━━━━━━━━━━━━━━━━━┛`;

                await sendMessage(promoteMsg, false, [user, update.author].filter(Boolean));

            } else if (update.action === 'demote' && config.ADMIN_EVENTS === 'true') {
                const demoter = update.author ? update.author.split('@')[0] : 'Unknown';
                const demoteMsg = 
`┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🔻 𝐔𝐒𝐄𝐑 𝐃𝐄𝐌𝐎𝐓𝐄𝐃 ⚠️
┣━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 🧑‍💼 Demoted: @${username}
┃ 👎 By: @${demoter}
┃ 🕒 Time: ${time}
┗━━━━━━━━━━━━━━━━━━━━━━━┛`;

                await sendMessage(demoteMsg, false, [user, update.author].filter(Boolean));
            }
        }
    } catch (err) {
        console.error('Group event error:', err);
    }
};

module.exports = GroupEvents;
