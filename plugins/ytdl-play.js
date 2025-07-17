const { cmd } = require('../command')
const fetch = require('node-fetch')

cmd({
  pattern: "play",
  alias: ["song", "ytplay"],
  desc: "Play audio from YouTube by song name.",
  category: "download",
  react: "🎶",
  filename: __filename
}, async (conn, m, msg, { text, args, prefix, command, reply }) => {
  if (!text) return reply(`❌ *Please provide a song name to play.*\n\n*Example:* ${prefix + command} Perfect by Ed Sheeran`);

  await conn.sendMessage(m.chat, { react: { text: "🎵", key: m.key } });

  try {
    let res = await fetch(`https://HansTz-hansapi.hf.space/yt?query=${encodeURIComponent(text)}`);
    let data = await res.json();

    if (!data || !data.url_audio) return reply("❌ Failed to fetch song. Try another name.");

    await conn.sendMessage(m.chat, {
      audio: { url: data.url_audio },
      mimetype: 'audio/mp4',
      fileName: `${data.title}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: `🎶 ${data.title}`,
          body: "Now Playing",
          thumbnailUrl: data.thumbnail,
          mediaType: 1,
          sourceUrl: data.url_audio,
          renderLargerThumbnail: true,
          showAdAttribution: true
        }
      }
    }, { quoted: m });

  } catch (err) {
    console.error("Play Plugin Error:", err);
    reply("❌ An error occurred while fetching the song.");
  }
})
