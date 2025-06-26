const axios = require('axios');
const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
  pattern: 'ss',
  alias: ['screenshot'],
  react: '🚀',
  desc: 'Download screenshot of a given link.',
  category: 'other',
  use: '.ss <link>',
  filename: __filename
}, async (client, message, match, { from, reply, q, sender }) => {
  try {
    if (!q) return reply('❗ Please provide a URL to capture a screenshot.');

    // Vérifie que l'URL commence par http:// ou https://
    if (!/^https?:\/\//.test(q)) 
      return reply('❗ Please provide a valid URL starting with http:// or https://');

    // Fonction pour envoyer l'image capturée en réponse
    const sendScreenshot = async (buffer) => {
      await client.sendMessage(from, {
        image: buffer,
        caption: `*📸 Screenshot Tool*\n\n🌐 *URL:* ${q}\n\n_*© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*_`,
        contextInfo: {
          mentionedJid: [sender],
          forwardingScore: 1000,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363401051937059@newsletter',
            newsletterName: '𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃',
            serverMessageId: 143
          }
        }
      }, { quoted: message });
    };

    // Appel à l'API de capture d'écran tierce
    const apiUrl = 'https://zenz.biz.id/tools/ssweb?url=' + encodeURIComponent(q);
    const response = await fetch(apiUrl);

    // Vérifie si la réponse a un header 'content-type' qui contient 'image/'
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.startsWith('image/')) {
      const imageBuffer = await response.buffer();
      return await sendScreenshot(imageBuffer);
    }

    // Sinon, récupère le JSON
    const data = await response.json();

    // Si l'API indique erreur ou pas de résultat valide
    if (!data.status || !data.result) 
      throw new Error('❌ Failed to capture the screenshot. Please try again later.');

    // Récupère le buffer de l'image depuis l'URL renvoyée
    const imageResponse = await fetch(data.result);
    const imageBuffer = await imageResponse.buffer();

    return await sendScreenshot(imageBuffer);

  } catch (err) {
    console.error(err);
    return reply('❌ Failed to capture the screenshot. Please try again later.');
  }
});
