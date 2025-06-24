const fetch = require('node-fetch');
const FormData = require('form-data');
const { cmd } = require('../command');

// Commande : .hd (ou .tohd / .remini)
cmd({
  pattern: 'hd',
  alias: ['tohd', 'remini'],
  desc: 'Enhance photo quality using AI (like Remini)',
  category: 'tools',
  filename: __filename,
  use: '.hd (reply to an image)'
}, async (conn, m, msg, { reply }) => {
  await conn.sendMessage(m.key.remoteJid, {
    react: { text: '⏳', key: m.key }
  });

  try {
    const message = m.quoted || m;
    const mime = (message.msg || message).mimetype || message.mimetype || '';

    if (!mime) throw '📷 Please send or reply to an image first.';
    if (!/image\/(jpe?g|png)/.test(mime)) throw `❌ The format *${mime}* is not supported.`;

    const buffer = await message.download?.();
    if (!buffer) throw '❌ Failed to download the image.';

    // 1. Upload to Catbox
    const imageURL = await uploadToCatbox(buffer);

    // 2. Send to enhancement API
    const apiURL = `https://zenz.biz.id/tools/remini?url=${encodeURIComponent(imageURL)}`;
    const apiResponse = await fetch(apiURL);
    if (!apiResponse.ok) throw '❌ Invalid response from API.';

    const json = await apiResponse.json();
    const resultURL = json.result?.result_url;
    if (!resultURL) throw '❌ Error accessing the Remini API.';

    // 3. Fetch enhanced image
    const finalImage = await fetch(resultURL).then(r => r.buffer());
    if (!finalImage || finalImage.length === 0) throw '❌ Failed to fetch enhanced image.';

    // 4. Send back the result
    await conn.sendMessage(m.key.remoteJid, {
      image: finalImage,
      caption: '✅ *ɪᴍᴀɢᴇ ᴇɴʜᴀɴᴄᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ!*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*'
    }, { quoted: m });

  } catch (err) {
    await conn.sendMessage(m.key.remoteJid, {
      react: { text: '❌', key: m.key }
    });
    console.error(err);
    reply(typeof err === 'string' ? err : '❌ An error occurred. Please try again later.');
  }
});

// 📤 Fonction d’upload vers Catbox
async function uploadToCatbox(imageBuffer) {
  const form = new FormData();
  form.append('reqtype', 'fileupload');
  form.append('userhash', 'test'); // Peut être remplacé par une clé Catbox si nécessaire
  form.append('fileToUpload', imageBuffer, 'image.jpg');

  const response = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: form
  });

  const result = await response.text();
  if (!result.startsWith('https://')) throw '❌ Error while uploading image to Catbox.';
  return result.trim();
}
