const axios = require('axios');
const { cmd } = require('../command');

cmd({
    pattern: "movie",
    desc: "Fetch detailed information about a movie.",
    category: "utility",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, reply, sender, args }) => {
    try {
        // Properly extract the movie name from arguments
        const movieName = args.length > 0 ? args.join(' ') : m.text.replace(/^[\.\#\$\!]?movie\s?/i, '').trim();
        
        if (!movieName) {
            return reply("📽️ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛʜᴇ ɴᴀᴍᴇ ᴏғ ᴛʜᴇ ᴍᴏᴠɪᴇ.\nᴇxᴀᴍᴘʟᴇ: .ᴍᴏᴠɪᴇ ɪʀᴏɴ ᴍᴀɴ");
        }

        const apiUrl = `https://apis.davidcyriltech.my.id/imdb?query=${encodeURIComponent(movieName)}`;
        const response = await axios.get(apiUrl);

        if (!response.data.status || !response.data.movie) {
            return reply("🚫 ᴍᴏᴠɪᴇ ɴᴏᴛ ғᴏᴜɴᴅ. ᴘʟᴇᴀsᴇ ᴄʜᴇᴄᴋ ᴛʜᴇ ɴᴀᴍᴇ ᴀɴᴅ ᴛʀʏ ᴀɢᴀɪɴ.");
        }

        const movie = response.data.movie;
        
        // Format the caption
        const dec = `
🎬 *${movie.title}* (${movie.year}) ${movie.rated || ''}

⭐ *ɪᴍᴅʙ:* ${movie.imdbRating || 'N/A'} | 🍅 *Rotten Tomatoes:* ${movie.ratings.find(r => r.source === 'Rotten Tomatoes')?.value || 'N/A'} | 💰 *Box Office:* ${movie.boxoffice || 'N/A'}

📅 *ʀᴇʟᴇᴀsᴇᴅ:* ${new Date(movie.released).toLocaleDateString()}
⏳ *ʀᴜɴᴛɪᴍᴇ:* ${movie.runtime}
🎭 *ɢᴇɴʀᴇ:* ${movie.genres}

📝 *ᴘʟᴏᴛ:* ${movie.plot}

🎥 *ᴅɪʀᴇᴄᴛᴏʀ:* ${movie.director}
✍️ *ᴡʀɪᴛᴇʀ:* ${movie.writer}
🌟 *ᴀᴄᴛᴏʀs:* ${movie.actors}

🌍 *ᴄᴏᴜɴᴛʀʏ:* ${movie.country}
🗣️ *ʟᴀɴɢᴜᴀɢᴇ:* ${movie.languages}
🏆 *ᴀᴡᴀʀᴅs:* ${movie.awards || 'None'}

[View on IMDb](${movie.imdbUrl})
`;

        // Send message with the requested format
        await conn.sendMessage(
            from,
            {
                image: { 
                    url: movie.poster && movie.poster !== 'N/A' ? movie.poster : 'https://files.catbox.moe/2ozipw.jpg'
                },
                caption: dec},
            { quoted: mek }
        );

    } catch (e) {
        console.error('Movie command error:', e);
        reply(`❌ Error: ${e.message}`);
    }
});
