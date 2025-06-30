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
    alias: ["ytmp3", "mp3", "song"],
    react: "🎵",
    desc: "Download Ytmp3",
    category: "download",
    use: ".play <query or yt url>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ sᴇᴀʀᴄʜ ǫᴜᴇʀʏ ᴏʀ ʏᴏᴜᴛᴜʙᴇ ᴜʀʟ.");

        let id = q.startsWith("https://") ? replaceYouTubeID(q) : null;

        if (!id) {
            const searchResults = await dy_scrap.ytsearch(q);
            if (!searchResults?.results?.length) return await reply("❌ ɴᴏ ʀᴇsᴜʟᴛs ғᴏᴜɴᴅ!");
            id = searchResults.results[0].videoId;
        }

        const data = await dy_scrap.ytsearch(`https://youtube.com/watch?v=${id}`);
        if (!data?.results?.length) return await reply("❌ Failed to fetch video!");

        const { url, title, image, timestamp, ago, views, author } = data.results[0];

        const info = `🍄 *SONG DOWNLOADER* 🍄\n\n` +
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

        const messageHandler = async (msgData) => {
            const receivedMsg = msgData.messages?.[0];
            if (!receivedMsg || !receivedMsg.message) return;

            const userReply = receivedMsg.message?.conversation ||
                receivedMsg.message?.extendedTextMessage?.text;

            const isReplyToSent = receivedMsg.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID;
            if (!isReplyToSent) return;

            let msg;
            let type;
            let response;

            if (userReply === "1.1") {
                msg = await conn.sendMessage(from, { text: "⏳ ᴘʀᴏᴄᴇssɪɴɢ..." }, { quoted: receivedMsg });
                response = await dy_scrap.ytmp3(`https://youtube.com/watch?v=${id}`);
                const downloadUrl = response?.result?.download?.url;
                if (!downloadUrl) return await reply("❌ Download link not found!");
                type = { audio: { url: downloadUrl }, mimetype: "audio/mpeg" };

            } else if (userReply === "1.2") {
                msg = await conn.sendMessage(from, { text: "⏳ ᴘʀᴏᴄᴇssɪɴɢ..." }, { quoted: receivedMsg });
                response = await dy_scrap.ytmp3(`https://youtube.com/watch?v=${id}`);
                const downloadUrl = response?.result?.download?.url;
                if (!downloadUrl) return await reply("❌ Download link not found!");
                type = {
                    document: { url: downloadUrl },
                    fileName: `${title}.mp3`,
                    mimetype: "audio/mpeg",
                    caption: title
                };
            } else {
                return await conn.sendMessage(from, {
                    text: "❌ Invalid choice! Reply with 1.1 or 1.2.",
                }, { quoted: receivedMsg });
            }

            await conn.sendMessage(from, type, { quoted: receivedMsg });
            await conn.sendMessage(from, {
                text: "✅ ᴍᴇᴅɪᴀ ᴜᴘʟᴏᴀᴅᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ ✅",
                edit: msg.key
            });
        };

        // Listener illimité
        conn.ev.on("messages.upsert", messageHandler);

    } catch (error) {
        console.error("❌ Error in .play:", error);
        await reply("⚠️ An error occurred while processing.");
    }
});
