const axios = require('axios');
const yts = require('yt-search');
const { cmd } = require('../command'); // Chemin selon ta structure
const config = require('../config');

cmd({
    pattern: "play",
    alias: ["ytplay", "music"],
    desc: "Play audio from YouTube",
    category: "download",
    use: '.play <song name or YouTube URL>',
    filename: __filename
}, async (conn, m, msg, { q, prefix, command }) => {
    if (!q) return msg.reply(`❌ *ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ sᴏɴɢ ɴᴀᴍᴇ ᴏʀ ʏᴏᴜᴛᴜʙᴇ ʟɪɴᴋ.*\n\n📌 *ᴇxᴀᴍᴘʟᴇ:* ${prefix + command} ᴍᴏʀᴀʏᴏ ʙʏ ᴡɪᴢᴋɪᴅ`);

    try {
        const search = await yts(q);
        const video = search.videos[0];

        if (!video) return msg.reply(`❌ *No results found for:* ${q}`);

        const { title, url, thumbnail } = video;

        const caption = `🎶 *ᴍᴜsɪᴄ ғᴏᴜɴᴅ!*\n\n` +
                        `📌 *ᴛɪᴛʟᴇ:* ${title}\n` +
                        `🔗 *ʟɪɴᴋ:* ${url}\n\n` +
                        `⏬ ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ *ᴀᴜᴅɪᴏ*, ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ...`;

        await conn.sendMessage(msg.from, {
            image: { url: thumbnail },
            caption: caption
        }, { quoted: msg });

        const apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(url)}`;
        const { data } = await axios.get(apiUrl);

        if (data.success) {
            await conn.sendMessage(msg.from, {
                audio: { url: data.result.download_url },
                mimetype: 'audio/mp4',
                fileName: `${data.result.title}.mp3`,
                caption: `✅ *ɴᴏᴡ ᴘʟᴀʏɪɴɢ:* ${data.result.title}`
            }, { quoted: msg });
        } else {
            msg.reply(`❌ *ᴅᴏᴡɴʟᴏᴀᴅ ғᴀɪʟᴇᴅ.* ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ.`);
        }

    } catch (e) {
        console.error('[PLAY ERROR]', e);
        msg.reply(`❌ *An unexpected error occurred.*`);
    }
});
