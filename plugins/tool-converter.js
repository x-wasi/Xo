const converter = require('../data/converter');
const stickerConverter = require('../data/sticker-converter');
const { cmd } = require('../command');

cmd({
    pattern: 'convert',
    alias: ['sticker2img', 'stoimg', 'stickertoimage', 'photo'],
    desc: 'Convert stickers to images',
    category: 'convert',
    react: '🖼️',
    filename: __filename
}, async (client, match, message, { from }) => {
    // Input validation
    if (!message.quoted) {
        return await client.sendMessage(from, {
            text: "✨ *sᴛɪᴄᴋᴇʀ ᴄᴏɴᴠᴇʀᴛᴇʀ*\n\nᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀ sᴛɪᴄᴋᴇʀ ᴍᴇssᴀɢᴇ\n\nᴇxᴀᴍᴘʟᴇ: `.ᴄᴏɴᴠᴇʀᴛ` (ʀᴇᴘʟʏ ᴛᴏ sᴛɪᴄᴋᴇʀ)"
        }, { quoted: message });
    }

    if (message.quoted.mtype !== 'stickerMessage') {
        return await client.sendMessage(from, {
            text: "❌ Only sticker messages can be converted"
        }, { quoted: message });
    }

    // Send processing message
    await client.sendMessage(from, {
        text: "🔄 ᴄᴏɴᴠᴇʀᴛɪɴɢ sᴛɪᴄᴋᴇʀ ᴛᴏ ɪᴍᴀɢᴇ..."
    }, { quoted: message });

    try {
        const stickerBuffer = await message.quoted.download();
        const imageBuffer = await stickerConverter.convertStickerToImage(stickerBuffer);

        // Send result
        await client.sendMessage(from, {
            image: imageBuffer,
            caption: "> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ* 🤍",
            mimetype: 'image/png'
        }, { quoted: message });

    } catch (error) {
        console.error('Conversion error:', error);
        await client.sendMessage(from, {
            text: "❌ ᴘʟᴇᴀsᴇ ᴛʀʏ ᴡɪᴛʜ ᴀ ᴅɪғғᴇʀᴇɴᴛ sᴛɪᴄᴋᴇʀ."
        }, { quoted: message });
    }
});

cmd({
    pattern: 'tomp3',
    desc: 'Convert media to audio',
    category: 'convert',
    react: '🎵',
    filename: __filename
}, async (client, match, message, { from }) => {
    // Input validation
    if (!match.quoted) {
        return await client.sendMessage(from, {
            text: "*🔊 ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴠɪᴅᴇᴏ/ᴀᴜᴅɪᴏ ᴍᴇssᴀɢᴇ*"
        }, { quoted: message });
    }

    if (!['videoMessage', 'audioMessage'].includes(match.quoted.mtype)) {
        return await client.sendMessage(from, {
            text: "❌ ᴏɴʟʏ ᴠɪᴅᴇᴏ/ᴀᴜᴅɪᴏ ᴍᴇssᴀɢᴇs ᴄᴀɴ ʙᴇ ᴄᴏɴᴠᴇʀᴛᴇᴅ"
        }, { quoted: message });
    }

    if (match.quoted.seconds > 300) {
        return await client.sendMessage(from, {
            text: "⏱️ ᴍᴇᴅɪᴀ ᴛᴏᴏ ʟᴏɴɢ (ᴍᴀx 5 ᴍɪɴᴜᴛᴇs)"
        }, { quoted: message });
    }

    // Send processing message and store it
    await client.sendMessage(from, {
        text: "🔄 ᴄᴏɴᴠᴇʀᴛɪɴɢ ᴛᴏ ᴀᴜᴅɪᴏ..."
    }, { quoted: message });

    try {
        const buffer = await match.quoted.download();
        const ext = match.quoted.mtype === 'videoMessage' ? 'mp4' : 'm4a';
        const audio = await converter.toAudio(buffer, ext);

        // Send result
        await client.sendMessage(from, {
            audio: audio,
            mimetype: 'audio/mpeg'
        }, { quoted: message });

    } catch (e) {
        console.error('Conversion error:', e.message);
        await client.sendMessage(from, {
            text: "❌ ғᴀɪʟᴇᴅ ᴛᴏ ᴘʀᴏᴄᴇss ᴀᴜᴅɪᴏ"
        }, { quoted: message });
    }
});

cmd({
    pattern: 'toptt',
    desc: 'Convert media to voice message',
    category: 'convert',
    react: '🎙️',
    filename: __filename
}, async (client, match, message, { from }) => {
    // Input validation
    if (!match.quoted) {
        return await client.sendMessage(from, {
            text: "*🗣️ ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴠɪᴅᴇᴏ/ᴀᴜᴅɪᴏ ᴍᴇssᴀɢᴇ*"
        }, { quoted: message });
    }

    if (!['videoMessage', 'audioMessage'].includes(match.quoted.mtype)) {
        return await client.sendMessage(from, {
            text: "❌ ᴏɴʟʏ ᴠɪᴅᴇᴏ/ᴀᴜᴅɪᴏ ᴍᴇssᴀɢᴇs ᴄᴀɴ ʙᴇ ᴄᴏɴᴠᴇʀᴛᴇᴅ"
        }, { quoted: message });
    }

    if (match.quoted.seconds > 60) {
        return await client.sendMessage(from, {
            text: "⏱️ ᴍᴇᴅɪᴀ ᴛᴏᴏ ʟᴏɴɢ ғᴏʀ ᴠᴏɪᴄᴇ (ᴍᴀx 1 ᴍɪɴᴜᴛᴇ)"
        }, { quoted: message });
    }

    // Send processing message
    await client.sendMessage(from, {
        text: "🔄 ᴄᴏɴᴠᴇʀᴛɪɴɢ ᴛᴏ ᴠᴏɪᴄᴇ ᴍᴇssᴀɢᴇ..."
    }, { quoted: message });

    try {
        const buffer = await match.quoted.download();
        const ext = match.quoted.mtype === 'videoMessage' ? 'mp4' : 'm4a';
        const ptt = await converter.toPTT(buffer, ext);

        // Send result
        await client.sendMessage(from, {
            audio: ptt,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
        }, { quoted: message });

    } catch (e) {
        console.error('PTT conversion error:', e.message);
        await client.sendMessage(from, {
            text: "❌ Failed to create voice message"
        }, { quoted: message });
    }
});

