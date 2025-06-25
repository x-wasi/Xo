const config = require('../config');
const { cmd } = require('../command');
const DY_SCRAP = require('@dark-yasiya/scrap');
const dy_scrap = new DY_SCRAP();

function replaceYouTubeID(url) {
    const regex = /(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

cmd({
    pattern: "song",
    alias: ["video"],
    react: "🎬",
    desc: "Download Ytmp4",
    category: "download",
    use: ".video <Text or YT URL>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ǫᴜᴇʀʏ ᴏʀ ʏᴏᴜᴛᴜʙᴇ ᴜʀʟ!");

        let id = q.startsWith("https://") ? replaceYouTubeID(q) : null;
        let videoData;

        if (!id) {
            const searchResults = await dy_scrap.ytsearch(q);
            if (!searchResults?.results?.length) return await reply("❌ No results found!");
            videoData = searchResults.results[0];
            id = videoData.videoId;
        } else {
            const searchResults = await dy_scrap.ytsearch(`https://youtube.com/watch?v=${id}`);
            if (!searchResults?.results?.length) return await reply("❌ Failed to fetch video!");
            videoData = searchResults.results[0];
        }

        // Préchargement du MP4
        const preloadedVideo = dy_scrap.ytmp4(`https://youtube.com/watch?v=${id}`);

        const { url, title, image, timestamp, ago, views, author } = videoData;

        let info = `🎥 *𝚅𝙸𝙳𝙴𝙾 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁* 🎥\n\n` +
            `🎬 *ᴛɪᴛʟᴇ:* ${title || "Unknown"}\n` +
            `⏱ *ᴅᴜʀᴀᴛɪᴏɴ:* ${timestamp || "Unknown"}\n` +
            `👁 *ᴠɪᴇᴡs:* ${views || "Unknown"}\n` +
            `📅 *ʀᴇʟᴇᴀsᴇ ᴀɢᴏ:* ${ago || "Unknown"}\n` +
            `👤 *ᴀᴜᴛʜᴏʀ:* ${author?.name || "Unknown"}\n` +
            `🔗 *ᴜʀʟ:* ${url || "Unknown"}\n\n` +
            `🎞 *ʀᴇᴘʟʏ ᴡɪᴛʜ ʏᴏᴜʀ ᴄʜᴏɪᴄᴇ:*\n` +
            `2.1 *ᴠɪᴅᴇᴏ ᴛʏᴘᴇ* 🎬\n` +
            `2.2 *ᴅᴏᴄᴜᴍᴇɴᴛ ᴛʏᴘᴇ* 📁\n\n` +
            `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*`;

        const sentMsg = await conn.sendMessage(from, { image: { url: image }, caption: info }, { quoted: mek });
        const messageID = sentMsg.key.id;
        await conn.sendMessage(from, { react: { text: '🎥', key: sentMsg.key } });

        // Écoute réponse unique
        const listener = async (messageUpdate) => {
            try {
                const mekInfo = messageUpdate?.messages[0];
                if (!mekInfo?.message) return;

                const messageType = mekInfo?.message?.conversation || mekInfo?.message?.extendedTextMessage?.text;
                const isReplyToSentMsg = mekInfo?.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID;

                if (!isReplyToSentMsg) return;

                conn.ev.off('messages.upsert', listener);

                let userReply = messageType.trim();
                let msg;
                let type;
                let response = await preloadedVideo;

                const downloadUrl = response?.result?.download?.url;
                if (!downloadUrl) return await reply("❌ Download link not found!");

                if (userReply === "2.1") {
                    msg = await conn.sendMessage(from, { text: "⏳ ᴘʀᴏᴄᴇssɪɴɢ..." }, { quoted: mek });
                    type = { video: { url: downloadUrl }, mimetype: "video/mp4", caption: title };
                } else if (userReply === "2.2") {
                    msg = await conn.sendMessage(from, { text: "⏳ ᴘʀᴏᴄᴇssɪɴɢ..." }, { quoted: mek });
                    type = {
                        document: { url: downloadUrl },
                        fileName: `${title}.mp4`,
                        mimetype: "video/mp4",
                        caption: title
                    };
                } else {
                    return await reply("❌ ɪɴᴠᴀʟɪᴅ ᴄʜᴏɪᴄᴇ! ʀᴇᴘʟʏ ᴡɪᴛʜ 2.1 or 2.2.");
                }

                await conn.sendMessage(from, type, { quoted: mek });
                await conn.sendMessage(from, { text: '✅ ᴍᴇᴅɪᴀ ᴜᴘʟᴏᴀᴅ sᴜᴄᴄᴇssғᴜʟ ✅', edit: msg.key });

            } catch (error) {
                console.error(error);
                await reply(`❌ *An error occurred while processing:* ${error.message || "Error!"}`);
            }
        };

        conn.ev.on('messages.upsert', listener);

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        await reply(`❌ *An error occurred:* ${error.message || "Error!"}`);
    }
});
