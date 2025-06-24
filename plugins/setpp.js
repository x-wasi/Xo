const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');

// 📁 Assure-toi d’avoir cette fonction si elle n’existe pas déjà :
async function generateProfilePicture(bufferPath) {
  const jimp = require('jimp');
  const image = await jimp.read(bufferPath);
  const square = image.cover(720, 720); // 1:1 format
  const img = await square.getBufferAsync(jimp.MIME_JPEG);
  return { img };
}

cmd({
  pattern: "setppbot",
  desc: "Change the bot's profile picture",
  category: "owner",
  filename: __filename
}, async (conn, m, msg, { prefix, command, args, quoted, mime, isCreator }) => {

  const botNumber = conn.user.id;

  if (!isCreator) return m.reply("🚫 *Only the bot owner can use this command.*");

  if (!quoted || !/image/.test(mime) || /webp/.test(mime)) {
    return m.reply(`📸 Send or reply to an *image* with the caption: *${prefix + command}*`);
  }

  try {
    const fileName = 'ppbot.jpeg';
    const filePath = path.resolve(fileName);

    const media = await conn.downloadAndSaveMediaMessage(quoted, filePath);

    if (args[0] && args[0].toLowerCase() === 'full') {
      const { img } = await generateProfilePicture(media);
      await conn.query({
        tag: 'iq',
        attrs: {
          to: botNumber,
          type: 'set',
          xmlns: 'w:profile:picture'
        },
        content: [{
          tag: 'picture',
          attrs: { type: 'image' },
          content: img
        }]
      });
    } else {
      await conn.updateProfilePicture(botNumber, { url: media });
    }

    fs.unlinkSync(media);
    m.reply("✅ Bot profile picture updated successfully.");
  } catch (err) {
    console.error(err);
    m.reply("❌ Failed to update profile picture.");
  }
});