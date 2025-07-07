const axios = require('axios');
const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');
const config = require('../config');
const { cmd, commands } = require('../command');


cmd({
  pattern: 'tgs',
  alias: ['tgsticker', 'telegramsticker'],
  react: '🎴',
  desc: 'Download and convert Telegram sticker packs to WhatsApp stickers',
  category: 'convert',
  filename: __filename
}, async (conn, mek, m, { from, reply, args, sender, pushname }) => {
  try {
  
    // Check if a Telegram sticker link is provided
    if (!args[0]) {
      reply('ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴛᴇʟᴇɢʀᴀᴍ sᴛɪᴄᴋᴇʀ ᴘᴀᴄᴋ ʟɪɴᴋ.\n\n ᴇxᴀᴍᴘʟᴇ `tgs` https://t.me/addstickers/telegram ');
      return;
    }

    const lien = args.join(' ');
    const name = lien.split('/addstickers/')[1];

    if (!name) {
      reply('Invalid Telegram sticker link.');
      return;
    }

    const api = `https://api.telegram.org/bot7025486524:AAGNJ3lMa8610p7OAIycwLtNmF9vG8GfboM/getStickerSet?name=${encodeURIComponent(name)}`;

    // Fetch sticker pack details
    const stickers = await axios.get(api);

    let type = stickers.data.result.is_animated ? 'animated sticker' : 'not animated sticker';

    let message = `*𝐓𝐄𝐋𝐄𝐆𝐑𝐀𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑*\n\n` +
                  `*ᴘʀᴏᴅᴜᴄᴇʀ:* ${stickers.data.result.name}\n` +
                  `*ᴛʏᴘᴇ:* ${type}\n` +
                  `*ʟᴇɴɢᴛʜ:* ${stickers.data.result.stickers.length}\n\n` +
                  `> ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ sᴛɪᴄᴋᴇʀ...`;

   // await reply(message);
await conn.sendMessage(
            from,
            {
                image: { url: config.MENU_IMAGE_URL },
                caption: message,
                
            },
            { quoted: mek }
        );
    

    // Loop through each sticker in the pack
    for (let i = 0; i < stickers.data.result.stickers.length; i++) {
      const file = await axios.get(`https://api.telegram.org/bot7025486524:AAGNJ3lMa8610p7OAIycwLtNmF9vG8GfboM/getFile?file_id=${stickers.data.result.stickers[i].file_id}`);

      const buffer = await axios({
        method: 'get',
        url: `https://api.telegram.org/file/bot7025486524:AAGNJ3lMa8610p7OAIycwLtNmF9vG8GfboM/${file.data.result.file_path}`,
        responseType: 'arraybuffer',
      });

      // Create a WhatsApp sticker
      const sticker = new Sticker(buffer.data, {
        pack: '𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃',
        author: `${pushname}`,
        type: StickerTypes.FULL,
        categories: ['🤩', '🎉'],
        id: '12345',
        quality: 50,
        background: '#000000'
      });

      const stickerBuffer = await sticker.toBuffer();

      // Send the sticker
      await conn.sendMessage(
        from,
        { sticker: stickerBuffer },
        { quoted: mek }
      );

      // Add a small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    reply('sᴛɪᴄᴋᴇʀ ᴘᴀᴄᴋ ᴅᴏᴡɴʟᴏᴀᴅ ᴄᴏᴍᴘʟᴇᴛᴇ!');

  } catch (error) {
    console.error('Error ᴘʀᴏᴄᴇssɪɴɢ Telegram sticker pack:', error);
    reply('An error occurred while processing the sticker pack. Please try again.');
  }
});
