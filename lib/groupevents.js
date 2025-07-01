// Credits DybyTech - MEGALODON-MD 💜 
// https://whatsapp.com/channel/0029VbAdcIXJP216dKW1253g

const { isJidGroup } = require('baileys');
const config = require('../config');
const { loadSettings } = require('./groupMessagesStorage');

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

const formatMessage = (template, data) => {
    return template
        .replace(/{user}/g, data.user)
        .replace(/{group}/g, data.group)
        .replace(/{count}/g, data.count)
        .replace(/{desc}/g, data.desc)
        .replace(/{date}/g, data.date)
        .replace(/{time}/g, data.time);
};

const GroupEvents = async (conn, update) => {
    try {
        if (!isJidGroup(update.id) || !Array.isArray(update.participants)) return;

        const settings = loadSettings();
        const welcomeSettings = settings.welcome || {};
        const goodbyeSettings = settings.goodbye || {};

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
            const date = new Date();
            const time = date.toLocaleTimeString();
            const fullDate = date.toLocaleDateString();
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

            const data = {
                user: username,
                group: groupName,
                count: memberCount.toString(),
                desc: groupDesc,
                date: fullDate,
                time: time,
            };

            if (update.action === 'add' && config.WELCOME === 'true') {
                const setting = welcomeSettings[update.id];
                if (setting?.enabled) {
                    const message = formatMessage(setting.message, data);
                    await sendMessage(message, true);
                }

            } else if (update.action === 'remove' && config.WELCOME === 'true') {
                const setting = goodbyeSettings[update.id];
                if (setting?.enabled) {
                    const message = formatMessage(setting.message, data);
                    await sendMessage(message, true);
                }

            } else if (update.action === 'promote' && config.ADMIN_EVENTS === 'true') {
                const promoter = update.author ? update.author.split('@')[0] : 'Inconnu';
                const promoteMsg = 
`┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🔺 𝐏𝐑𝐎𝐌𝐎𝐓𝐈𝐎𝐍  🎖️
┣━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 🧑‍💼 ᴘʀᴏᴍᴏᴛᴇᴅ: @${username}
┃ 👑 ʙʏ: @${promoter}
┃ 🕒 ᴛɪᴍᴇ: ${time}
┗━━━━━━━━━━━━━━━━━━━━━━━┛`;
                await sendMessage(promoteMsg, false, [user, update.author].filter(Boolean));

            } else if (update.action === 'demote' && config.ADMIN_EVENTS === 'true') {
                const demoter = update.author ? update.author.split('@')[0] : 'Inconnu';
                const demoteMsg = 
`┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🔻 𝐃𝐄𝐌𝐎𝐓𝐈𝐎𝐍  ⚠️
┣━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 🧑‍💼 ᴅᴇᴍᴏᴛᴇᴅ: @${username}
┃ 👎 ʙʏ: @${demoter}
┃ 🕒 ᴛɪᴍᴇ: ${time}
┗━━━━━━━━━━━━━━━━━━━━━━━┛`;
                await sendMessage(demoteMsg, false, [user, update.author].filter(Boolean));
            }
        }
    } catch (err) {
        console.error('Group event error:', err);
    }
};

// === Messages par défaut exportables pour les commandes .welcome / .goodbye ===

const defaultWelcomeMessage = 
`┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃  👋 𝐍𝐄𝐖 𝐌𝐄𝐌𝐁𝐄𝐑 🎉
┣━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 🧑‍💼 ᴜsᴇʀ: @{user}
┃ 📅 ᴊᴏɪɴᴇᴅ: {date} {time}
┃ 🧮 ᴍᴇᴍʙᴇʀs: {count}
┃ 🏷️ ɢʀᴏᴜᴘ: {group}
┣━━━━━━━━━━━━━━━━━━━━━━━
┃ 📌 Description:
┃ {desc}
┗━━━━━━━━━━━━━━━━━━━━━━━┛`;

const defaultGoodbyeMessage = 
`┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃  👋 𝐌𝐄𝐌𝐁𝐄𝐑 𝐋𝐄𝐅𝐓 😢
┣━━━━━━━━━━━━━━━━━━━━━━━
┃ 🧑‍💼 ᴜsᴇʀ: @{user}
┃ 📅 ʟᴇғᴛ: {date} {time}
┃ 🧮 ʀᴇᴍᴀɪɴɪɴɢ: {count}
┗━━━━━━━━━━━━━━━━━━━━━━━┛`;

module.exports = GroupEvents;
module.exports.defaultWelcomeMessage = defaultWelcomeMessage;
module.exports.defaultGoodbyeMessage = defaultGoodbyeMessage;

module.exports = GroupEvents;
