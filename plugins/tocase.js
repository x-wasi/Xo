const fs = require("fs");
const path = require("path");
const { cmd } = require("../command");

cmd({
  pattern: "tocase",
  alias: ["cmd2case"],
  desc: "Convert a plugin using cmd() to switch/case format",
  category: "owner",
  filename: __filename
}, async (conn, m, msg, { q, reply }) => {
  try {
    if (!q) return reply("❎ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴘʟᴜɢɪɴ ᴏʀ sᴘᴇᴄɪғʏ ɪᴛs ғɪʟᴇ ɴᴀᴍᴇ.\n\n*ᴇxᴀᴍᴘʟᴇ:* .tocase fancy.js");

    const filePath = path.join(__dirname, q.trim());

    if (!fs.existsSync(filePath)) return reply("❌ ғɪʟᴇ ɴᴏᴛ ғᴏᴜɴᴅ ɪɴ ᴘʟᴜɢɪɴs ꜰᴏʟᴅᴇʀ.");

    const content = fs.readFileSync(filePath, "utf-8");

    const headerMatch = content.match(/cmd\s*{([\s\S]*?)}\s*,/);
    const bodyMatch = content.match(/cmd\s*{[\s\S]*?},\s*async\s*[\s\S]*?\s*=>\s*{([\s\S]*?)\n}/);

    if (!headerMatch || !bodyMatch) return reply("❌ ɴᴏ ᴄᴏᴍᴍᴀɴᴅ ꜰᴏᴜɴᴅ ɪɴ ᴛʜɪs ꜰɪʟᴇ.");

    const jsonHeader = `{${headerMatch[1]}}`.replace(/(\w+):/g, '"$1":');
    const command = JSON.parse(jsonHeader);
    const names = [command.pattern, ...(command.alias || [])].filter(Boolean);
    const body = bodyMatch[1].trim();

    const caseBlock = names.map(n => `case '${n}':`).join("\n") + ` {\n${body}\n  break;\n}`;

    return reply("✅ *Converted Case Code:*\n\n```js\n" + caseBlock + "\n```");

  } catch (e) {
    console.error(e);
    return reply("❌ ᴇʀʀᴏʀ ᴡʜɪʟᴇ ᴘᴀʀsɪɴɢ ᴛʜᴇ ᴄᴍᴅ ғɪʟᴇ.");
  }
});
