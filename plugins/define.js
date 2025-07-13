const axios = require('axios');
const { cmd } = require('../command');

cmd({
    pattern: "define",
    desc: "📖 Get the definition of a word",
    react: "🔍",
    category: "search",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ a ᴡᴏʀᴅ ᴛᴏ ᴅᴇғɪɴᴇ.\n\n📌 *ᴜsᴀɢᴇ:* .ᴅᴇғɪɴᴇ [ᴡᴏʀᴅ]");

        const word = q.trim();
        const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

        const response = await axios.get(url);
        const definitionData = response.data[0];

        const definition = definitionData.meanings[0].definitions[0].definition;
        const example = definitionData.meanings[0].definitions[0].example || '❌ No example available';
        const synonyms = definitionData.meanings[0].definitions[0].synonyms.join(', ') || '❌ No synonyms available';
        const phonetics = definitionData.phonetics[0]?.text || '🔇 No phonetics available';
        const audio = definitionData.phonetics[0]?.audio || null;

        const wordInfo = `
📖 *ᴡᴏʀᴅ*: *${definitionData.word}*  
🗣️ *ᴘʀᴏɴᴜɴᴄɪᴀᴛɪᴏɴ*: _${phonetics}_  
📚 *ᴅᴇғɪɴɪᴛɪᴏɴ*: ${definition}  
✍️ *ᴇxᴀᴍᴘʟᴇ*: ${example}  
📝 *sʏɴᴏɴʏᴍs*: ${synonyms}  

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*`;

        if (audio) {
            await conn.sendMessage(from, { audio: { url: audio }, mimetype: 'audio/mpeg' }, { quoted: mek });
        }

        return reply(wordInfo);
    } catch (e) {
        console.error("❌ Error:", e);
        if (e.response && e.response.status === 404) {
            return reply("🚫 *Word not found.* Please check the spelling and try again.");
        }
        return reply("⚠️ An error occurred while fetching the definition. Please try again later.");
    }
});
