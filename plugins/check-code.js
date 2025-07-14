const axios = require("axios");
const { cmd } = require("../command");

function getFlagEmoji(countryCode) {
  if (!countryCode) return "";
  return countryCode
    .toUpperCase()
    .split("")
    .map(c => String.fromCodePoint(c.charCodeAt(0) + 127397))
    .join("");
}

cmd({
  pattern: "check",
  desc: "Check country from calling code",
  category: "utility",
  filename: __filename
}, async (conn, mek, m, { args, reply }) => {
  try {
    let code = args[0];
    if (!code) return reply("*ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴄᴏᴜɴᴛʀʏ ᴄᴏᴅᴇ. ᴇxᴀᴍᴘʟᴇ: `.ᴄʜᴇᴄᴋ 509`*");

    code = code.replace(/\D/g, '');

    const { data } = await axios.get(`https://restcountries.com/v2/callingcode/${code}`);
    
    if (!data || data.status === 404) {
      return reply(`❌ ɴᴏ ᴄᴏᴜɴᴛʀʏ ғᴏᴜɴᴅ ғᴏʀ ᴛʜᴇ ᴄᴏᴅᴇ +${code}.`);
    }

    const countryList = data.map(c => `${getFlagEmoji(c.alpha2Code)} ${c.name}`).join("\n");
    reply(`📮 *ᴄᴏᴜɴᴛʀʏ ᴄᴏᴅᴇ*: +${code}\n🌍 *ᴄᴏᴜɴᴛʀɪᴇs*:\n${countryList}`);
  } catch (e) {
    console.error("❌ API error:", e.message);
    reply(`❌ Error: ${e.message}`);
  }
});
