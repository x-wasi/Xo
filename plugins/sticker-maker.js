const { cmd } = require('../command');
const crypto = require('crypto');
const webp = require('node-webpmux');
const axios = require('axios');
const fs = require('fs-extra');
const { exec } = require('child_process');
const { Sticker, createSticker, StickerTypes } = require("wa-sticker-formatter");
const Config = require('../config');

// Take Sticker 


cmd(
  {
    pattern: 'take',
    alias: ['rename', 'stake'],
    desc: 'Create a sticker using user\'s name as pack name (supports animated).',
    category: 'sticker',
    use: '<reply to image or sticker>',
    filename: __filename,
  },
  async (conn, mek, m, { quoted, reply }) => {
    if (!quoted) return reply('❌ Please reply to an image, video or sticker.');

    let mime = quoted.mtype;
    let media = await quoted.download();
    if (!media) return reply('❌ Failed to download media.');

    const senderName = m.pushName || 'Sticker Pack';
    const isAnimated =
      quoted.isAnimated ||
      mime === 'videoMessage' ||
      (mime === 'stickerMessage' && quoted.msg?.isAnimated);

    try {
      const sticker = new Sticker(media, {
        pack: senderName,
        author: 'ᴍᴇɢᴀʟᴏᴅᴏɴ-ᴍᴅ',
        type: isAnimated ? StickerTypes.CROPPED : StickerTypes.FULL,
        categories: ['🔥', '✨'],
        id: 'custom-sticker',
        quality: 75,
        background: 'transparent',
      });

      const buffer = await sticker.toBuffer();
      await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: mek });
    } catch (e) {
      console.error(e);
      reply('❌ Error while creating sticker.');
    }
  }
);
//Sticker create 

cmd(
    {
        pattern: 'sticker',
        alias: ['s', 'stickergif'],
        desc: 'Create a sticker from an image, video, or URL.',
        category: 'sticker',
        use: '<reply media or URL>',
        filename: __filename,
    },
    async (conn, mek, m, { quoted, args, q, reply, from }) => {
        if (!mek.quoted) return reply(`*Reply to any Image or Video, Sir.*`);
        let mime = mek.quoted.mtype;
        let pack = Config.STICKER_NAME || "ᴍᴇɢᴀʟᴏᴅᴏɴ ᴍᴅ";
        
        if (mime === "imageMessage" || mime === "stickerMessage") {
            let media = await mek.quoted.download();
            let sticker = new Sticker(media, {
                pack: pack, 
                type: StickerTypes.FULL,
                categories: ["🤩", "🎉"], 
                id: "12345",
                quality: 75, 
                background: 'transparent',
            });
            const buffer = await sticker.toBuffer();
            return conn.sendMessage(mek.chat, { sticker: buffer }, { quoted: mek });
        } else {
            return reply("*Uhh, Please reply to an image.*");
        }
    }
);

// DybyTech 
