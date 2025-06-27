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
        use: '<reply to image or sticker>',
        filename: __filename,
    },
    async (conn, mek, m, { quoted, reply }) => {
        if (!mek.quoted) return reply(`❌ ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀɴ ɪᴍᴀɢᴇ ᴏʀ sᴛɪᴄᴋᴇʀ.`);

        let mime = mek.quoted.mtype;
        let userName = `𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃`;
        let packName = `${userName}`;

        if (
            mime === "imageMessage" || 
            mime === "stickerMessage" || 
            mime === "videoMessage" // for animated stickers/gifs
        ) {
            let media = await mek.quoted.download();
            let isAnimated = mek.quoted.isAnimated || mime === "videoMessage";

            let sticker = new Sticker(media, {
                pack: packName,
                author: userName,
                type: isAnimated ? StickerTypes.CROPPED : StickerTypes.FULL,
                categories: ["🔥", "✨"],
                quality: 75,
                id: "animated-sticker",
                background: "transparent",
            });

            const buffer = await sticker.toBuffer();
            return conn.sendMessage(mek.chat, { sticker: buffer }, { quoted: mek });
        } else {
            return reply(`❌ ᴏɴʟʏ ɪᴍᴀɢᴇs, ᴠɪᴅᴇᴏs, ᴏʀ sᴛɪᴄᴋᴇʀs ᴀʀᴇ sᴜᴘᴘᴏʀᴛᴇᴅ.`);
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
