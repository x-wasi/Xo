const axios = require('axios');
const { cmd } = require('../command');

cmd({
    pattern: "tempmail",
    alias: ["genmail"],
    desc: "Generate a new temporary email address",
    category: "utility",
    react: "📧",
    filename: __filename
},
async (conn, mek, m, { from, reply, prefix }) => {
    try {
        const response = await axios.get('https://apis.davidcyriltech.my.id/temp-mail');
        const { email, session_id, expires_at } = response.data;

        // Format the expiration time and date
        const expiresDate = new Date(expires_at);
        const timeString = expiresDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        const dateString = expiresDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        // Create the complete message
        const message = `
📧 *𝐓𝐄𝐌𝐏𝐎𝐑𝐀𝐑𝐘 𝐄𝐌𝐀𝐈𝐋 𝐆𝐄𝐍𝐄𝐑𝐀𝐓𝐄𝐃*

✉️ *ᴇᴍᴀɪʟ ᴀᴅᴅʀᴇss:*
${email}

⏳ *ᴇxᴘɪʀᴇs:*
${timeString} • ${dateString}

🔑 *sᴇssɪᴏɴ ɪᴅ:*
\`\`\`${session_id}\`\`\`

📥 *ᴄʜᴇᴄᴋ ɪɴʙᴏx:*
.ɪɴʙᴏx ${session_id}

_ᴇᴍᴀɪʟ ᴡɪʟʟ ᴇxᴘɪʀᴇ ᴀғᴛᴇʀ 24 ʜᴏᴜʀs_
`;

        await conn.sendMessage(
            from,
            { 
                text: message,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401051937059@newsletter',
                        newsletterName: 'ᴛᴇᴍᴘᴀɪʟ sᴇʀᴠɪᴄᴇ',
                        serverMessageId: 101
                    }
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.error('TempMail error:', e);
        reply(`❌ Error: ${e.message}`);
    }
});
cmd({
    pattern: "checkmail",
    alias: ["inbox", "tmail", "mailinbox"],
    desc: "Check your temporary email inbox",
    category: "utility",
    react: "📬",
    filename: __filename
},
async (conn, mek, m, { from, reply, args }) => {
    try {
        const sessionId = args[0];
        if (!sessionId) return reply('🔑 ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ʏᴏᴜʀ sᴇssɪᴏɴ ɪᴅ\nExample: .ᴄʜᴇᴄᴋᴍᴀɪʟ ʏᴏᴜʀ_sᴇssɪᴏɴ_ɪᴅ');

        const inboxUrl = `https://apis.davidcyriltech.my.id/temp-mail/inbox?id=${encodeURIComponent(sessionId)}`;
        const response = await axios.get(inboxUrl);

        if (!response.data.success) {
            return reply('❌ ɪɴᴠᴀʟɪᴅ sᴇssɪᴏɴ ɪᴅ ᴏʀ ᴇxᴘɪʀᴇᴅ ᴇᴍᴀɪʟ');
        }

        const { inbox_count, messages } = response.data;

        if (inbox_count === 0) {
            return reply('📭 Your inbox is empty');
        }

        let messageList = `📬 *You have ${inbox_count} message(s)*\n\n`;
        messages.forEach((msg, index) => {
            messageList += `━━━━━━━━━━━━━━━━━━\n` +
                          `📌 *ᴍᴇssᴀɢᴇ ${index + 1}*\n` +
                          `👤 *ғʀᴏᴍ:* ${msg.from}\n` +
                          `📝 *sᴜʙᴊᴇᴄᴛ:* ${msg.subject}\n` +
                          `⏰ *ᴅᴀᴛᴇ:* ${new Date(msg.date).toLocaleString()}\n\n` +
                          `📄 *ᴄᴏɴᴛᴇɴᴛ:*\n${msg.body}\n\n`;
        });

        await reply(messageList);

    } catch (e) {
        console.error('CheckMail error:', e);
        reply(`❌ Error checking inbox: ${e.response?.data?.message || e.message}`);
    }
});
