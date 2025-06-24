const { isJidGroup } = require('@whiskeysockets/baileys');
const { loadMessage, getAnti } = require('../data');
const config = require('../config');

// 📝 Gère les messages texte supprimés
const DeletedText = async (conn, msg, from, caption, isGroup, m) => {
    const content = msg.message?.conversation || msg.message?.extendedTextMessage?.text || 'Unknown content';
    caption += '\n◈ Content ━ ' + content;

    await conn.sendMessage(from, {
        text: caption,
        contextInfo: {
            mentionedJid: isGroup
                ? [m.key.remoteJid, msg.key.participant]
                : [m.key.remoteJid]
        }
    }, { quoted: msg });
};

// 📷 Gère les médias supprimés (image, vidéo, document, audio)
const DeletedMedia = async (conn, msg, from, caption) => {
    const message = structuredClone(msg.message);
    const type = Object.keys(message)[0];

    message[type].key = {
        stanzaId: msg.key.id,
        participant: msg.participant,
        quotedMessage: msg.message
    };

    if (type === 'imageMessage' || type === 'videoMessage') {
        message[type].caption = caption;
    } else if (type === 'audioMessage' || type === 'documentMessage') {
        await conn.sendMessage(from, { text: '\n◈ Content ━ ' + caption }, { quoted: msg });
    }

    await conn.relayMessage(from, message, {});
};

// 🚨 Fonction principale anti-suppression
const AntiDelete = async (conn, msgs) => {
    for (const m of msgs) {
        if (m.message?.message == null) {
            const saved = await loadMessage(m.key.id);
            if (saved && saved.message) {
                const msg = saved.message;
                const isGroup = isJidGroup(saved.jid);
                const antiEnabled = await getAnti();
                if (!antiEnabled) continue;

                const time = new Date().toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });

                let caption, from;
                if (isGroup) {
                    const metadata = await conn.groupMetadata(saved.jid);
                    const groupName = metadata.subject;
                    const user = msg.key.participant?.split('@')[0];
                    const deleter = m.key.remoteJid?.split('@')[0];

                    caption = `*╭──⬡ 𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃 ⬡───*\n*├♻️ SENDER:* @${user}\n*├👥 GROUP:* ${groupName}\n*├⏰ DELETE TIME:* ${time}\n*├🗑️ DELETED BY:* @${deleter}\n*╰💬 MESSAGE:* Content Below 🔽`;
                    from = config.ANTI_DEL_PATH === 'user' ? conn.user.id : saved.jid;
                } else {
                    const user = msg.key.remoteJid?.split('@')[0];
                    const deleter = m.key.remoteJid?.split('@')[0];

                    caption = `*╭──⬡ 𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃 ⬡──*\n*├👤 SENDER:* @${user}\n*├⏰ DELETE TIME:* ${time}\n*╰💬 MESSAGE:* Content Below 🔽`;
                    from = config.ANTI_DEL_PATH === 'user' ? conn.user.id : m.key.remoteJid;
                }

                if (msg.message?.conversation || msg.message?.extendedTextMessage)
                    await DeletedText(conn, msg, from, caption, isGroup, m);
                else
                    await DeletedMedia(conn, msg, from, caption);
            }
        }
    }
};

module.exports = {
    DeletedText,
    DeletedMedia,
    AntiDelete
};
