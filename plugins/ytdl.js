const config = require('../config');
const { cmd } = require('../command');
const DY_SCRAP = require('@dark-yasiya/scrap');
const dy_scrap = new DY_SCRAP();

function extractYouTubeID(url) {
    const regex = /(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

cmd({
    pattern: "play",
    alias: ["mp3", "ytmp3", "song"],
    react: "🎵",
    desc: "Download YouTube MP3",
    category: "download",
    use: ".play <query or YouTube URL>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ sᴇᴀʀᴄʜ ǫᴜᴇʀʏ ᴏʀ ʏᴏᴜᴛᴜʙᴇ ᴜʀʟ.");

        let id = q.startsWith("http") ? extractYouTubeID(q) : null;

        if (!id) {
            const search = await dy_scrap.ytsearch(q);
            if (!search?.results?.length) return reply("❌ No video found.");
            id = search.results[0].videoId;
        }

        const url = `https://youtube.com/watch?v=${id}`;
        const data = await dy_scrap.ytsearch(url);
        if (!data?.results?.length) return reply("❌ Failed to fetch video data.");

        const video = data.results[0];
        const audioData = await dy_scrap.ytmp3(url);
        const mp3 = audioData?.result?.download?.url;
        if (!mp3) return reply("❌ Failed to get download link.");

        const caption = `🍄 *𝚂𝙾𝙽𝙶 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁*\n\n` +
                        `🎵 *ᴛɪᴛʟᴇ:* ${video.title}\n` +
                        `⏳ *ᴅᴜʀᴀᴛɪᴏɴ:* ${video.timestamp}\n` +
                        `👀 *ᴠɪᴇᴡs:* ${video.views}\n` +
                        `🌏 *ᴀɢᴏ:* ${video.ago}\n` +
                        `👤 *ᴀᴜᴛʜᴏʀ:* ${video.author?.name}\n` +
                        `🖇 *ᴜʀʟ:* ${video.url}\n\n` +
                        `🔽 *ᴄʜᴏᴏsᴇ ғᴏʀᴍᴀᴛ:*\n` +
                        `1.1 ᴀᴜᴅɪᴏ 🎵\n1.2 ᴅᴏᴄᴜᴍᴇɴᴛ 📁`;

        const sent = await conn.sendMessage(from, { image: { url: video.image }, caption }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: '🎶', key: sent.key } });

        const filterReply = async (msg) => {
            const mText = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
            const isReply = msg.message?.extendedTextMessage?.contextInfo?.stanzaId === sent.key.id;
            if (!isReply) return;

            const choice = mText.trim();
            let type;

            if (choice === '1.1') {
                type = { audio: { url: mp3 }, mimetype: "audio/mpeg" };
            } else if (choice === '1.2') {
                type = {
                    document: { url: mp3 },
                    fileName: `${video.title}.mp3`,
                    mimetype: "audio/mpeg",
                    caption: video.title
                };
            } else {
                return reply("❌ ɪɴᴠᴀʟɪᴅ ᴄʜᴏɪᴄᴇ! ᴜsᴇ 1.1 ᴏʀ 1.2.");
            }

            await conn.sendMessage(from, type, { quoted: mek });
            await conn.sendMessage(from, { text: "✅ ᴜᴘʟᴏᴀᴅ sᴜᴄᴄᴇssғᴜʟ!" });
        };

        // Listen once to avoid multiple triggers
        conn.ev.once('messages.upsert', async (msg) => {
            try {
                const mData = msg.messages?.[0];
                if (!mData?.message) return;
                await filterReply(mData);
            } catch (e) {
                console.error(e);
                await reply("❌ Error while processing reply.");
            }
        });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        await reply("❌ Error: " + (e.message || "Unknown error"));
    }
});
