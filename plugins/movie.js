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
            return reply("📽️ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛʜᴇ ɴᴀᴍᴇ ᴏғ ᴛʜᴇ ᴍᴏᴠɪᴇ.\nExample: .ᴍᴏᴠɪᴇ ɪʀᴏɴ ᴍᴀɴ");
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

⭐ *ɪᴍᴅʙ:* ${movie.imdbRating || 'N/A'} | 🍅 *Rotten Tomatoes:* ${movie.ratings.find(r => r.source === 'Rotten Tomatoes')?.value || 'N/A'} | 💰 *ʙᴏx ᴏғғɪᴄᴇ:* ${movie.boxoffice || 'N/A'}

📅 *ʀᴇʟᴇᴀsᴇᴅ:* ${new Date(movie.released).toLocaleDateString()}
⏳ *ʀᴜɴᴛɪᴍᴇ:* ${movie.runtime}
🎭 *ɢᴇɴʀᴇ:* ${movie.genres}

📝 *Plot:* ${movie.plot}

🎥 *ᴅɪʀᴇᴄᴛᴏʀ:* ${movie.director}
✍️ *ᴡʀɪᴛᴇʀ:* ${movie.writer}
🌟 *ᴀᴄᴛᴏʀs:* ${movie.actors}

🌍 *ᴄᴏᴜɴᴛʀʏ:* ${movie.country}
🗣️ *ʟᴀɴɢᴜᴀɢᴇ:* ${movie.languages}
🏆 *ᴀᴡᴀʀᴅs:* ${movie.awards || 'None'}

[View on IMDb](${movie.imdbUrl})

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*`;

        // Send message with the requested format
        await conn.sendMessage(
            from,
            {
                image: { 
                    url: movie.poster && movie.poster !== 'N/A' ? movie.poster : 'https://files.catbox.moe/w1l8b0.jpg'
                },
                caption: dec,
                contextInfo: {
                    mentionedJid: [sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401051937059@newsletter',
                        newsletterName: '𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃',
                        serverMessageId: 143
                    }
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.error('Movie command error:', e);
        reply(`❌ Error: ${e.message}`);
    }
});
