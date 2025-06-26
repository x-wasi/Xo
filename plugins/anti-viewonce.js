const fs = require("fs");
const { cmd } = require("../command");
const path = "./data/antivv.json";

// Create the data file if it doesn't exist
if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({ enabled: true }));

// Functions to read/write status
const getStatus = () => JSON.parse(fs.readFileSync(path));
const setStatus = (status) => fs.writeFileSync(path, JSON.stringify({ enabled: status }));

// Command to turn Anti View Once on/off
cmd({
  pattern: "antivv",
  alias: ["anti-viewonce", "antiviewonce"],
  desc: "Toggle automatic opening of view-once messages",
  category: "owner",
  use: ".antivv on / off",
  filename: __filename
}, async (client, m, match) => {
  const arg = match?.[1]?.toLowerCase();
  if (!["on", "off"].includes(arg)) {
    return m.reply(`❌ Usage: *.antivv on* / *.antivv off*\nCurrent status: ${getStatus().enabled ? "✅ Enabled" : "❌ Disabled"}`);
  }

  setStatus(arg === "on");
  return m.reply(`✅ Anti View Once is now *${arg.toUpperCase()}*`);
});

// Hook to automatically open view-once messages
module.exports = {
  name: "antivv_auto_open",
  event: "messages.upsert",
  async handler(client, update) {
    const status = getStatus().enabled;
    if (!status) return;

    try {
      const message = update.messages?.[0];
      if (!message || !message.message) return;

      const from = message.key.remoteJid;
      const isViewOnce = message.message?.viewOnceMessageV2 || message.message?.viewOnceMessage;
      if (!isViewOnce) return;

      const msg = message.message.viewOnceMessageV2?.message || message.message.viewOnceMessage?.message;
      const type = Object.keys(msg)[0];
      if (!["imageMessage", "videoMessage"].includes(type)) return;

      const { downloadMediaMessage } = require("@whiskeysockets/baileys");
      const buffer = await downloadMediaMessage(
        { message: { message: msg }, key: message.key },
        "buffer",
        {},
        { reuploadRequest: client.updateMediaMessage }
      );

      const caption = `👀 View Once Media Opened by AntiVV\n👤 From: @${message.key.participant?.split("@")[0] || message.key.remoteJid.split("@")[0]}`;
      const options = { caption, mentions: [message.key.participant || message.key.remoteJid] };

      if (type === "imageMessage") {
        await client.sendMessage(from, { image: buffer, ...options }, { quoted: message });
      } else if (type === "videoMessage") {
        await client.sendMessage(from, { video: buffer, ...options }, { quoted: message });
      }
    } catch (e) {
      console.error("[AntiVV Error]", e);
    }
  }
};
