const { cmd } = require("../command");
const { fetchEmix } = require("../lib/emix-utils");
const { getBuffer } = require("../lib/functions");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");

cmd({
    pattern: "emix",
    desc: "Combine two emojis into a sticker.",
    category: "fun",
    react: "😃",
    use: ".emix 😂,🙂",
    filename: __filename,
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        if (!q.includes(",")) {
            return reply("❌ *ᴜsᴀɢᴇ:* .ᴇᴍɪx 😂,🙂\n_sᴇɴᴅ ᴛᴡᴏ ᴇᴍᴏᴊɪs sᴇᴘᴀʀᴀᴛᴇᴅ ʙʏ ᴀ ᴄᴏᴍᴍᴀ._");
        }

        let [emoji1, emoji2] = q.split(",").map(e => e.trim());

        if (!emoji1 || !emoji2) {
            return reply("❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴡᴏ ᴇᴍᴏᴊɪs sᴇᴘᴀʀᴀᴛᴇᴅ ʙʏ ᴀ ᴄᴏᴍᴍᴀ.");
        }

        let imageUrl = await fetchEmix(emoji1, emoji2);

        if (!imageUrl) {
            return reply("❌ ᴄᴏᴜʟᴅ ɴᴏᴛ ɢᴇɴᴇʀᴀᴛᴇ ᴇᴍᴏᴊɪ ᴍɪx. ᴛʀʏ ᴅɪғғᴇʀᴇɴᴛ ᴇᴍᴏᴊɪs.");
        }

        let buffer = await getBuffer(imageUrl);
        let sticker = new Sticker(buffer, {
            pack: "Emoji Mix",
            author: "𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃",
            type: StickerTypes.FULL,
            categories: ["🤩", "🎉"],
            quality: 75,
            background: "transparent",
        });

        const stickerBuffer = await sticker.toBuffer();
        await conn.sendMessage(mek.chat, { sticker: stickerBuffer }, { quoted: mek });

    } catch (e) {
        console.error("Error in .emix command:", e.message);
        reply(`❌ Could not generate emoji mix: ${e.message}`);
    }
});
          
