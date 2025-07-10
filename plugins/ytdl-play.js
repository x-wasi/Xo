const config = require('../config');
const { cmd } = require('../command');
const fetch = require('node-fetch'); // assure-toi que 'node-fetch' est installé

cmd({
    pattern: "song",
    alias: ["play2", "music02"],
    react: "🎵",
    desc: "Download audio from YouTube",
    category: "download",
    use: ".song <query or url>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a song name or YouTube URL!");

        await reply("⏳ Searching and downloading audio...");

        const apiUrl = `https://hans-apis.vercel.app/download/ytmp3?query=${encodeURIComponent(q)}`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        if (!data.result || !data.result.download_url) {
            return reply("❌ Failed to fetch the audio. Try another song.");
        }

        await conn.sendMessage(from, {
            audio: { url: data.result.download_url },
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: mek });

        await reply(`✅ *${data.result.title}* downloaded successfully!`);

    } catch (error) {
        console.error(error);
        await reply(`❌ Error: ${error.message}`);
    }
});
