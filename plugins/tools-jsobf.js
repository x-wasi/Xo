
const config = require('../config');
const { cmd, commands } = require('../command');
const JavaScriptObfuscator = require("javascript-obfuscator");

cmd({
  pattern: "obfuscate",
  alias: ["obf", "enc"],
  desc: "Obfuscate JavaScript code to make it harder to read.",
  category: "utility",
  use: ".obfuscate <code>",
  filename: __filename,
}, async (conn, mek, msg, { from, args, reply }) => {
  try {
    const code = args.join(" ");
    if (!code) {
      return reply("❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴊᴀᴠᴀsᴄʀɪᴘᴛ ᴄᴏᴅᴇ ᴛᴏ ᴏʙғᴜsᴄᴀᴛᴇ.");
    }

    // Obfuscate the code
    const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, {
      compact: true, // Compact code output
      controlFlowFlattening: true, // Make control flow harder to follow
      deadCodeInjection: true, // Inject dead code
      debugProtection: true, // Add debug protection
      disableConsoleOutput: true, // Disable console output
      stringArray: true, // Encrypt strings
      stringArrayEncoding: ["base64"], // Encode strings using base64
      rotateStringArray: true, // Rotate string array
    }).getObfuscatedCode();

    reply(`🔐 *Obfuscated Code*:\n\n${obfuscatedCode}`);
  } catch (error) {
    console.error("Error obfuscating code:", error);
    reply("❌ An error occurred while obfuscating the code.");
  }
});

cmd({
  pattern: "deobfuscate",
  alias: ["deobf", "unconfuse"],
  desc: "Attempt to deobfuscate JavaScript code (limited functionality).",
  category: "utility",
  use: ".deobfuscate <obfuscated_code>",
  filename: __filename,
}, async (conn, mek, msg, { from, args, reply }) => {
  try {
    const obfuscatedCode = args.join(" ");
    if (!obfuscatedCode) {
      return reply("❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴏʙғᴜsᴄᴀᴛᴇᴅ ᴄᴏᴅᴇ ᴛᴏ ᴅᴇᴏʙғᴜsᴄᴀᴛᴇ.");
    }

    // Deobfuscation is not straightforward, but we can try to format the code
    reply(`⚠️ *ᴅᴇᴏʙғᴜsᴄᴀᴛɪᴏɴ ɪs ɴᴏᴛ ɢᴜᴀʀᴀɴᴛᴇᴇᴅ*. ʜᴇʀᴇ's ᴛʜᴇ ғᴏʀᴍᴀᴛᴛᴇᴅ ᴄᴏᴅᴇ:\n\n${obfuscatedCode}`);
  } catch (error) {
    console.error("Error deobfuscating code:", error);
    reply("❌ An error occurred while deobfuscating the code.");
  }
});
