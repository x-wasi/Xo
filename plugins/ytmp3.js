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
    pattern: "play",
    alias: ["mp3", "ytmp3"],
    react: "🎵",
    desc: "Download Ytmp3",
    category: "download",
    use: ".song <Text or YT URL>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a Query or Youtube URL!");

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

        // Pré-chargement du MP3
        const preloadedAudio = dy_scrap.ytmp3(`https://youtube.com/watch?v=${id}`);

        const { url, title, image, timestamp, ago, views, author } = videoData;

        let info = `🍄 *𝚂𝙾𝙽𝙶 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁* 🍄\n\n` +
            `🎵 *ᴛɪᴛʟᴇ:* ${title || "Unknown"}\n` +
            `⏳ *ᴅᴜʀᴀᴛɪᴏɴ:* ${timestamp || "Unknown"}\n` +
            `👀 *ᴠɪᴇᴡs:* ${views || "Unknown"}\n` +
            `🌏 *ʀᴇʟᴇᴀsᴇ ᴀɢᴏ:* ${ago || "Unknown"}\n` +
            `👤 *ᴀᴜᴛʜᴏʀ:* ${author?.name || "Unknown"}\n` +
            `🖇 *ᴜʀʟ:* ${url || "Unknown"}\n\n` +
            `🔽 *ʀᴇᴘʟʏ ᴡɪᴛʜ ʏᴏᴜʀ ᴄʜᴏɪᴄᴇ:*\n` +
            `1.1 *ᴀᴜᴅɪᴏ ᴛʏᴘᴇ* 🎵\n` +
            `1.2 *ᴅᴏᴄᴜᴍᴇɴᴛ ᴛʏᴘᴇ* 📁\n\n` +
            `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*`;

        const sentMsg = await conn.sendMessage(from, { image: { url: image }, caption: info }, { quoted: mek });
        const messageID = sentMsg.key.id;
        await conn.sendMessage(from, { react: { text: '🎶', key: sentMsg.key } });

        // Gestion unique de réponse utilisateur
        const listener = async (messageUpdate) => {
            try {
                const mekInfo = messageUpdate?.messages[0];
                if (!mekInfo?.message) return;

                const messageType = mekInfo?.message?.conversation || mekInfo?.message?.extendedTextMessage?.text;
                const isReplyToSentMsg = mekInfo?.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID;

                if (!isReplyToSentMsg) return;

                conn.ev.off('messages.upsert', listener); // retire le listener après première réponse

                let userReply = messageType.trim();
                let msg;
                let type;
                let response = await preloadedAudio;

                const downloadUrl = response?.result?.download?.url;
                if (!downloadUrl) return await reply("❌ ᴅᴏᴡɴʟᴏᴀᴅ ʟɪɴᴋ ɴᴏᴛ ғᴏᴜɴᴅ!");

                if (userReply === "1.1") {
                    msg = await conn.sendMessage(from, { text: "⏳ ᴘʀᴏᴄᴇssɪɴɢ..." }, { quoted: mek });
                    type = { audio: { url: downloadUrl }, mimetype: "audio/mpeg" };
                } else if (userReply === "1.2") {
                    msg = await conn.sendMessage(from, { text: "⏳ ᴘʀᴏᴄᴇssɪɴɢ..." }, { quoted: mek });
                    type = {
                        document: { url: downloadUrl },
                        fileName: `${title}.mp3`,
                        mimetype: "audio/mpeg",
                        caption: title
                    };
                } else {
                    return await reply("❌ ɪɴᴠᴀʟɪᴅ ᴄʜᴏɪᴄᴇ! ʀᴇᴘʟʏ ᴡɪᴛʜ 1.1 ᴏʀ 1.2.");
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
