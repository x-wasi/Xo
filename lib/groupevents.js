const { isJidGroup } = require('baileys');
const { loadSettings } = require('./groupMessagesStorage');
const config = require('../config');

const fallbackPP = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';

const defaultWelcomeMessage = 
`┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃  👋 𝐍𝐄𝐖 𝐌𝐄𝐌𝐁𝐄𝐑 𝐉𝐎𝐈𝐍𝐄𝐃  🎉
┣━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 🧑‍💼 ᴡᴇʟᴄᴏᴍᴇ: {user}
┃ 🧮 ᴍᴇᴍʙᴇʀs: {count}
┃ 🏷️ ɢʀᴏᴜᴘ: {group}
┃ 📅 ᴅᴀᴛᴇ: {date} | {time}
┣━━━━━━━━━━━━━━━━━━━━━━━
┃ 📌 Description:
┃ {desc}
┗━━━━━━━━━━━━━━━━━━━━━━━┛`;

const defaultGoodbyeMessage = 
`┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃  👋 𝐌𝐄𝐌𝐁𝐄𝐑 𝐋𝐄𝐅𝐓  😢
┣━━━━━━━━━━━━━━━━━━━━━━━
┃ 🧑‍💼 {user}
┃ 🧮 Remaining: {count}
┃ 🏷️ ɢʀᴏᴜᴘ: {group}
┃ 📅 ʟᴇғᴛ: {date} | {time}
┗━━━━━━━━━━━━━━━━━━━━━━━┛`;

function formatTemplate(template, { user, group, count, desc }) {
    const now = new Date();
    const date = now.toLocaleDateString('fr-FR');
    const time = now.toLocaleTimeString('fr-FR');
    return template
        .replace(/{user}/g, user)
        .replace(/{group}/g, group)
        .replace(/{count}/g, count)
        .replace(/{desc}/g, desc)
        .replace(/{date}/g, date)
        .replace(/{time}/g, time);
}

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
        const groupId = update.id;
        const groupName = metadata.subject;
        const groupDesc = metadata.desc || 'No description available.';
        const memberCount = metadata.participants.length;

        const settings = loadSettings();
        const welcomeConfig = settings.welcome?.[groupId] || {};
        const goodbyeConfig = settings.goodbye?.[groupId] || {};

        let groupPP;
        try {
            groupPP = await conn.profilePictureUrl(groupId, 'image');
        } catch {
            groupPP = fallbackPP;
        }

        for (const user of update.participants) {
            const username = user.split('@')[0];
            const userMention = `@${username}`;
            const time = new Date().toLocaleString();
            let userPP;

            try {
                userPP = await conn.profilePictureUrl(user, 'image');
            } catch {
                userPP = groupPP;
            }

            const sendMessage = async (text, image = true, mentions = [user]) => {
                const msg = {
                    contextInfo: getContextInfo({ sender: user }),
                    mentions,
                };
                if (image) msg.image = { url: userPP }, msg.caption = text;
                else msg.text = text;
                await conn.sendMessage(groupId, msg);
            };

            if (update.action === 'add' && (config.WELCOME === 'true' || welcomeConfig.enabled)) {
                const template = welcomeConfig.message || defaultWelcomeMessage;
                const message = formatTemplate(template, {
                    user: userMention,
                    group: groupName,
                    count: memberCount,
                    desc: groupDesc
                });
                await sendMessage(message, true);
            }

            if (update.action === 'remove' && (config.WELCOME === 'true' || goodbyeConfig.enabled)) {
                const template = goodbyeConfig.message || defaultGoodbyeMessage;
                const message = formatTemplate(template, {
                    user: userMention,
                    group: groupName,
                    count: memberCount,
                    desc: groupDesc
                });
                await sendMessage(message, true);
            }

            if (update.action === 'promote' && config.ADMIN_EVENTS === 'true') {
                const promoter = update.author ? update.author.split('@')[0] : 'unknown';
                const promoteMsg = 
`🔺 𝐏𝐑𝐎𝐌𝐎𝐓𝐈𝐎𝐍 🎖️
👤 ᴘʀᴏᴍᴏᴛᴇᴅ: @${username}
👑 ʙʏ: @${promoter}
🕒 ᴛɪᴍᴇ: ${time}`;
                await sendMessage(promoteMsg, false, [user, update.author]);
            }

            if (update.action === 'demote' && config.ADMIN_EVENTS === 'true') {
                const demoter = update.author ? update.author.split('@')[0] : 'unknown';
                const demoteMsg = 
`🔻 𝐃𝐄𝐌𝐎𝐓𝐈𝐎𝐍 ⚠️
👤 ᴅᴇᴍᴏᴛᴇᴅ: @${username}
👎 ʙʏ: @${demoter}
🕒 ᴛɪᴍᴇ: ${time}`;
                await sendMessage(demoteMsg, false, [user, update.author]);
            }
        }
    } catch (err) {
        console.error('Group event error:', err);
    }
};

module.exports = {
    GroupEvents,
    defaultWelcomeMessage,
    defaultGoodbyeMessage
};
module.exports = GroupEvents;
