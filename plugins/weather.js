const axios = require('axios');
const config = require('../config');
const { cmd, commands } = require('../command');
cmd({
    pattern: "weather",
    desc: "🌤 Get weather information for a location",
    react: "🌤",
    category: "other",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❗ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴄɪᴛʏ ɴᴀᴍᴇ. ᴜsᴀɢᴇ: .ᴡᴇᴀᴛʜᴇʀ [ᴄɪᴛʏ ɴᴀᴍᴇ]");
        const apiKey = '2d61a72574c11c4f36173b627f8cb177'; 
        const city = q;
        const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const response = await axios.get(url);
        const data = response.data;
        const weather = `
> 🌍 *ᴡᴇᴀᴛʜᴇʀ ɪɴғᴏʀᴍᴀᴛɪᴏɴ ғᴏʀ ${data.name}, ${data.sys.country}* 🌍
> 🌡️ *ᴛᴇᴍᴘᴇʀᴀᴛᴜʀᴇ*: ${data.main.temp}°C
> 🌡️ *ғᴇᴇʟs ʟɪᴋᴇ*: ${data.main.feels_like}°C
> 🌡️ *ᴍɪɴ ᴛᴇᴍᴘ*: ${data.main.temp_min}°C
> 🌡️ *ᴍᴀx ᴛᴇᴍᴘ*: ${data.main.temp_max}°C
> 💧 *ʜᴜᴍɪᴅɪᴛʏ*: ${data.main.humidity}%
> ☁️ *ᴡᴇᴀᴛʜᴇʀ*: ${data.weather[0].main}
> 🌫️ *ᴅᴇsᴄʀɪᴘᴛɪᴏɴ*: ${data.weather[0].description}
> 💨 *ᴡɪɴᴅ sᴘᴇᴇᴅ*: ${data.wind.speed} m/s
> 🔽 *ᴘʀᴇssᴜʀᴇ*: ${data.main.pressure} hPa

> *© ᴘᴏᴡᴅᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*
`;
        return reply(weather);
    } catch (e) {
        console.log(e);
        if (e.response && e.response.status === 404) {
            return reply("🚫 City not found. Please check the spelling and try again.");
        }
        return reply("⚠️ An error occurred while fetching the weather information. Please try again later.");
    }
});
                 
