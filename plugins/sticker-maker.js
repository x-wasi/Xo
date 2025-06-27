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
        desc: 'Create a sticker using your name as the pack name (supports animated).',
        category: 'sticker',
        use: '<reply media>',
        filename: __filename,
    },
    async (conn, mek, m, { quoted, args, q, reply }) => {
        if (!quoted) return reply(`❌ Reply to an image, sticker or short video.`);
        let mime = quoted.mtype || '';
        let packname = q || mek.pushName || Config.STICKER_NAME || 'ᴍᴇɢᴀʟᴏᴅᴏɴ';

        let media = await quoted.download().catch(() => null);
        if (!media) return reply("❌ Failed to download media.");

        let stickerType = StickerTypes.FULL;

        if (mime === "videoMessage") {
            // WhatsApp allows only short animated stickers
            stickerType = StickerTypes.CROPPED; // Or .DEFAULT if you want full size
        }

        try {
            const sticker = new Sticker(media, {
                pack: packname,
                author: "ᴍᴇɢᴀʟᴏᴅᴏɴ",
                type: stickerType,
                quality: 70,
                categories: ["🔥", "🥶"],
                id: "take-cmd",
            });

            const buffer = await sticker.toBuffer();
            await conn.sendMessage(mek.chat, { sticker: buffer }, { quoted: mek });
        } catch (err) {
            console.error(err);
            reply("❌ Error creating sticker. Make sure the video is under 10s.");
        }
    }
);

//sticker 

cmd(
    {
        pattern: 'sticker',
        alias: ['s', 'stickergif'],
        desc: 'Create a sticker from an image, video, or sticker.',
        category: 'sticker',
        use: '<reply to image, video, or sticker>',
        filename: __filename,
    },
    async (conn, mek, m, { quoted, reply }) => {
        if (!quoted) return reply(`❌ Reply to an image, sticker or short video.`);
        
        let mime = quoted.mtype || '';
        let packname = Config.STICKER_NAME || "ᴍᴇɢᴀʟᴏᴅᴏɴ ᴍᴅ";

        let media = await quoted.download().catch(() => null);
        if (!media) return reply("❌ Failed to download media.");

        let stickerType = StickerTypes.FULL;

        if (mime === "videoMessage") {
            stickerType = StickerTypes.CROPPED; // Recommended for video
        }

        try {
            const sticker = new Sticker(media, {
                pack: packname,
                author: "ᴍᴇɢᴀʟᴏᴅᴏɴ",
                type: stickerType,
                quality: 70,
                categories: ["🔥", "🎉"],
                id: "default-sticker",
            });

            const buffer = await sticker.toBuffer();
            await conn.sendMessage(mek.chat, { sticker: buffer }, { quoted: mek });
        } catch (err) {
            console.error(err);
            reply("❌ Error creating sticker. Ensure video is under 10 seconds.");
        }
    }
);
