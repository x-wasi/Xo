const { cmd } = require('../lib/command')
const { getBuffer } = require('../lib/functions')
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const FormData = require('form-data')

cmd({
  pattern: "shazam",
  alias: ["findsong", "musicid"],
  desc: "Identify music from audio or video",
  category: "tools",
  filename: __filename
}, async (conn, m, msg, { quoted, mime, reply }) => {
  try {
    // Vérifie si l'utilisateur a répondu à un message
    if (!quoted || (!/audio|video/.test(mime))) {
      return reply('❌ Please reply to an *audio* or *video* to identify the song.')
    }

    reply('🔍 Identifying music, please wait...')

    const mediaPath = path.join(__dirname, '../temp/' + Date.now() + '.mp3')
    const buff = await quoted.download()
    fs.writeFileSync(mediaPath, buff)

    const form = new FormData()
    form.append('file', fs.createReadStream(mediaPath))

    // Remplace cette URL par celle de ton API d’identification musicale
    const { data } = await axios.post('https://api.zeks.me/api/searchmusic', form, {
      headers: {
        ...form.getHeaders(),
        'apikey': 'ZEKSI_API_KEY' // Remplace par ta clé API
      }
    })

    fs.unlinkSync(mediaPath)

    if (!data || !data.result) return reply('❌ Music not found.')

    const res = data.result

    const msgInfo = `👋 Hi @${m.sender.split('@')[0]}, here is your music info:

📌 *TITLE:* ${res.title}
🎤 *ARTIST:* ${res.artists}
💿 *ALBUM:* ${res.album || "Unknown"}
🎶 *GENRE:* ${res.genre || "Unknown"}
📅 *RELEASE DATE:* ${res.release_date || "Unknown"}
`

    await conn.sendMessage(m.chat, {
      image: { url: res.cover || config.MENU_IMAGE_URL },
      caption: msgInfo,
      mentions: [m.sender]
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    reply('❌ Error identifying music.')
  }
})
