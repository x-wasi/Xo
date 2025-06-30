const config = require('../config');
const { cmd } = require('../command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');
const fetch = require('node-fetch');
const ytsearch = require('yt-search');

// MP4 video download


cmd({ 
    pattern: "mp4", 
    alias: ["video"], 
    react: "🎥", 
    desc: "Download YouTube video", 
    category: "download", 
    use: '.mp4 < YouTube link or song name >', 
    filename: __filename 
}, async (conn, mek, m, { from, q, reply }) => { 
    try { 
        if (!q) return await reply("❌ Please provide a YouTube URL or video name.");

        const yt = await ytsearch(q);
        if (!yt.videos.length) return reply("❌ No results found!");

        const video = yt.videos[0];
        const apiUrl = `https://ochinpo-helper.hf.space/yt?query=${encodeURIComponent(video.url)}`;
        
        const res = await fetch(apiUrl);
        if (!res.ok) return reply("❌ Failed to contact API server.");
        const data = await res.json();

        if (!data?.result?.downloadUrl) {
            return reply("❌ Failed to fetch the video. Please try again later.");
        }

        const caption = `📹 *YouTube Video Downloader*
🎬 *Title:* ${video.title}
⏳ *Duration:* ${video.timestamp}
👀 *Views:* ${video.views}
👤 *Author:* ${video.author.name}
🔗 *Link:* ${video.url}
🚀 *Powered by Dyby Tech*`;

        await conn.sendMessage(
            from, 
            { 
                video: { url: data.result.downloadUrl }, 
                caption: caption,
                mimetype: "video/mp4"
            }, 
            { quoted: mek }
        );

    } catch (e) {
        console.error(e);
        reply("❌ An error occurred. Please try again later.");
    }
});
// MP3 song download 




cmd({ 
    pattern: "play", 
    alias: ["song02", "mp3"], 
    react: "🎶", 
    desc: "Download YouTube song", 
    category: "download", 
    use: '.song <query>', 
    filename: __filename 
}, async (conn, mek, m, { from, sender, reply, q }) => { 
    try {
        if (!q) return reply("ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ sᴏɴɢ ɴᴀᴍᴇ ᴏʀ ʏᴏᴜᴛᴜʙᴇ ʟɪɴᴋ.");

        const yt = await ytsearch(q);
        if (!yt.results.length) return reply("No results found!");

        const song = yt.results[0];
        const apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(song.url)}`;
        
        const res = await fetch(apiUrl);
        const data = await res.json();

        if (!data?.result?.downloadUrl) return reply("Download failed. Try again later.");

    await conn.sendMessage(from, {
    audio: { url: data.result.downloadUrl },
    mimetype: "audio/mpeg",
    fileName: `${song.title}.mp3`}, { quoted: mek });

    } catch (error) {
        console.error(error);
        reply("An error occurred. Please try again.");
    }
});
