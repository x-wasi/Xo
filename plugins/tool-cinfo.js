const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "countryinfo",
    alias: ["cinfo", "country","cinfo2"],
    desc: "Get information about a country",
    category: "search",
    react: "🌍",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴄᴏᴜɴᴛʀʏ ɴᴀᴍᴇ.\nᴇxᴀᴍᴘʟᴇ: `.ᴄᴏᴜɴᴛʀʏɪɴғᴏ ɴɪɢᴇʀɪᴀ`");

        const apiUrl = `https://api.siputzx.my.id/api/tools/countryInfo?name=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.data) {
            await react("❌");
            return reply(`No information found for *${q}*. Please check the country name.`);
        }

        const info = data.data;
        let neighborsText = info.neighbors.length > 0
            ? info.neighbors.map(n => `🌍 *${n.name}*`).join(", ")
            : "No neighboring countries found.";

        const text = `🌍 *ᴄᴏᴜɴᴛʀʏ ɪɴғᴏʀᴍᴀᴛɪᴏɴ: ${info.name}* 🌍\n\n` +
                     `🏛 *ᴄᴀᴘɪᴛᴀʟ:* ${info.capital}\n` +
                     `📍 *ᴄᴏɴᴛɪɴᴇɴᴛ:* ${info.continent.name} ${info.continent.emoji}\n` +
                     `📞 *ᴘʜᴏɴᴇ ᴄᴏᴅᴇ:* ${info.phoneCode}\n` +
                     `📏 *ᴀʀᴇᴀ:* ${info.area.squareKilometers} km² (${info.area.squareMiles} mi²)\n` +
                     `🚗 *ᴅʀɪᴠɪɴɢ sɪᴅᴇ:* ${info.drivingSide}\n` +
                     `💱 *ᴄᴜʀʀᴇɴᴄʏ:* ${info.currency}\n` +
                     `🔤 *ʟᴀɴɢᴜᴀɢᴇs:* ${info.languages.native.join(", ")}\n` +
                     `🌟 *ғᴀᴍᴏᴜs ғᴏʀ:* ${info.famousFor}\n` +
                     `🌍 *ɪsᴏ ᴄᴏᴅᴇs:* ${info.isoCode.alpha2.toUpperCase()}, ${info.isoCode.alpha3.toUpperCase()}\n` +
                     `🌎 *ɪɴᴛᴇʀɴᴇᴛ ᴛʟᴅ:* ${info.internetTLD}\n\n` +
                     `🔗 *ɴᴇɪɢʜʙᴏʀs:* ${neighborsText}`;

        await conn.sendMessage(from, {
            image: { url: info.flag },
            caption: text,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: mek });

        await react("✅"); // React after successful response
    } catch (e) {
        console.error("Error in countryinfo command:", e);
        await react("❌");
        reply("An error occurred while fetching country information.");
    }
});
