const { cmd } = require("../command");
const fs = require("fs");
const path = require("path");
const config = require("../config");

const dbFile = path.join(__dirname, "../data/antivv.json");
let antiVV = fs.existsSync(dbFile) ? JSON.parse(fs.readFileSync(dbFile)) : {};

function saveDB() {
  fs.writeFileSync(dbFile, JSON.stringify(antiVV, null, 2));
}

// Command to toggle Anti-ViewOnce
cmd({
  pattern: "antiviewonce",
  alias: ["antivv", "antiview"],
  desc: "Owner/Admin only - Enable/Disable Anti-ViewOnce",
  category: "owner",
  filename: __filename,
}, async (client, m, match, { from, args, isGroup, isAdmin, sender }) => {
  const isOwner = config.owner.includes(sender.replace(/[^0-9]/g, ""));

  const state = args[0] === "on" ? true : args[0] === "off" ? false : null;
  if (state === null) return m.reply("Usage:\n.antiviewonce on\n.antiviewonce off");

  if (isGroup && !isAdmin) return m.reply("❌ Only group admins can toggle this.");
  if (!isGroup && !isOwner) return m.reply("❌ Only owner can toggle this in private chat.");

  antiVV[from] = state;
  saveDB();

  return m.reply(`✅ Anti-ViewOnce is now *${state ? "enabled" : "disabled"}* for this chat.`);
});

// Hook event inside plugin - automatically intercept viewOnce messages
cmd({
  pattern: "",
  fromMe: false,
  dontAddCommandList: true,
  filename: __filename,
}, async (client, m) => {
  try {
    if (!m.message || !m.message.viewOnceMessage) return;

    const { key, message, pushName } = m;
    const from = key.remoteJid;
    const sender = key.participant || from;
    const isGroup = from.endsWith("@g.us");
    const isOwner = config.owner.includes(sender.replace(/[^0-9]/g, ""));

    if (isGroup && !antiVV[from]) return;
    if (!isGroup && (!antiVV[from] || !isOwner)) return;

    const viewOnce = message.viewOnceMessage.message;
    if (!viewOnce) return;

    const type = Object.keys(viewOnce)[0];
    const buffer = await client.downloadMediaMessage(m);
    if (!buffer) return;

    let messageContent = {};
    switch (type) {
      case "imageMessage":
        messageContent = {
          image: buffer,
          caption: `👁‍🗨 ViewOnce image from ${pushName || "Unknown"}`,
          mimetype: viewOnce.imageMessage?.mimetype || "image/jpeg",
        };
        break;
      case "videoMessage":
        messageContent = {
          video: buffer,
          caption: `🎞️ ViewOnce video from ${pushName || "Unknown"}`,
          mimetype: viewOnce.videoMessage?.mimetype || "video/mp4",
        };
        break;
      case "audioMessage":
        messageContent = {
          audio: buffer,
          mimetype: viewOnce.audioMessage?.mimetype || "audio/mp4",
          ptt: viewOnce.audioMessage?.ptt || false,
        };
        break;
      default:
        return;
    }

    await client.sendMessage(from, messageContent, { quoted: m });
  } catch (e) {
    console.error("❌ AntiVV error:", e);
  }
});
