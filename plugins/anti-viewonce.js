const { cmd } = require("../command");
const config = require("../config");

cmd({
  pattern: "antivv",
  alias: [],
  desc: "Enable or disable Anti View Once feature",
  category: "settings",
  use: ".antivv on / off",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
  if (!isCreator) return reply("🚫 ᴏɴʟʏ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");

  const status = args[0]?.toLowerCase();
  if (status === "on") {
    config.ANTIVV = "true";
    return reply("✅ ᴀɴᴛɪ ᴠɪᴇᴡ ᴏɴᴄᴇ ʜᴀs ʙᴇᴇɴ *ᴇɴᴀʙʟᴇᴅ*.");
  } else if (status === "off") {
    config.ANTIVV = "false";
    return reply("❌ ᴀɴᴛɪ ᴠɪᴇᴡ ᴏɴᴄᴇ ʜᴀs ʙᴇᴇɴ *ᴅɪsᴀʙʟᴇᴅ*.");
  } else {
    return reply(`❓ ᴜsᴀɢᴇ: *.ᴀɴᴛɪᴠᴠ ᴏɴ* / *.ᴀɴᴛɪᴠᴠ ᴏғғ*\n📌 ᴄᴜʀʀᴇɴᴛ: ${config.ANTIVV === "true" ? "✅ ᴇɴᴀʙʟᴇᴅ" : "❌ ᴅɪsᴀʙʟᴇᴅ"}`);
  }
});
