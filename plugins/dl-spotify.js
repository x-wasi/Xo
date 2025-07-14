const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "spotify",
  alias: ["sp", "spotifydl"],
  react: '🎵',
  desc: "Search and download Spotify tracks",
  category: "music",
  use: ".spotify <song name>",
  filename: __filename
}, async (client, message, { reply, args }) => {
  try {
    // Proper args handling
    const query = args.length > 0 ? args.join(" ") : null;
    if (!query) return reply("ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ sᴏɴɢ ɴᴀᴍᴇ.\nExample: *.sᴘᴏᴛɪғʏ ғʟᴏᴡᴇʀs ʙʏ ᴍɪʟᴇʏ ᴄʏʀᴜs*");

    // Search for track
    const searchApiUrl = `https://draculazxy-xyzdrac.hf.space/api/Spotify?q=${encodeURIComponent(query)}`;
    const searchResponse = await axios.get(searchApiUrl, { timeout: 10000 });
    const searchData = searchResponse.data;

    if (searchData.STATUS !== 200) {
      return reply(`❌ Spotify search failed: ${searchData.message || 'No results found'}`);
    }

    // Extract song data
    const song = searchData.SONG || {};
    const spotifyInfo = `
🎵 *ᴛʀᴀᴄᴋ:* ${song.title || 'N/A'}
🎤 *ᴀʀᴛɪsᴛ:* ${song.artist || 'N/A'}
💿 *ᴀʟʙᴜᴍ:* ${song.album || 'N/A'}
📅 *ʀᴇʟᴇᴀsᴇ ᴅᴀᴛᴇ:* ${song.release_date || 'N/A'}
🔗 *sᴘᴏᴛɪғʏ ᴜʀʟ:* ${song.spotify_url || 'Not available'}
`.trim();

    // Send track info with cover art
    await client.sendMessage(message.chat, { 
      image: { url: song.cover_art }, 
      caption: spotifyInfo 
    }, { quoted: message });

    // Download if URL available
    if (!song.spotify_url) return reply("⚠️ Couldn't get download link - no Spotify URL found");

    const downloadResponse = await axios.get(
      `https://apis.davidcyriltech.my.id/spotifydl?url=${encodeURIComponent(song.spotify_url)}`, 
      { timeout: 15000 }
    );
    
    const dlData = downloadResponse.data;
    if (!dlData.success || !dlData.DownloadLink) {
      return reply(`❌ Download failed: ${dlData.message || 'No download link available'}`);
    }

    // Send audio file
    await client.sendMessage(message.chat, {
      audio: { url: dlData.DownloadLink },
      mimetype: 'audio/mpeg',
      ptt: false
    }, { quoted: message });

  } catch (error) {
    console.error('Spotify Error:', error);
    reply(`❌ Failed to process: ${error.message || 'Server error'}`);
  }
});
