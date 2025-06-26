const fs = require("fs");
const { cmd } = require("../command");
const path = "./data/antivv.json";

// Ensure the data file exists
if (!fs.existsSync("./data")) fs.mkdirSync("./data");
if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({ enabled: true }));

// Helpers to read/write status
const getStatus = () => {
  try {
    return JSON.parse(fs.readFileSync(path));
  } catch {
    return { enabled: true };
  }
};
const setStatus = (status) => {
  fs.writeFileSync(path, JSON.stringify({ enabled: status }, null, 2));
};

// Command: .antivv on / .antivv off
cmd({
  pattern: "antivv",
  alias: [],
  desc: "Toggle view-once auto-opening",
  category: "owner",
  use: ".antivv on / off",
  filename: __filename
}, async (client, m, match) => {
  const args = match?.[1]?.toLowerCase();
  if (!args || !["on", "off"].includes(args)) {
    const current = getStatus().enabled;
    return m.reply(`📍 Anti View Once is currently: ${current ? "✅ ENABLED" : "❌ DISABLED"}\nUsage: *.antivv on* or *.antivv off*`);
  }

  const newStatus = args === "on";
  setStatus(newStatus);
  return m.reply(`✅ Anti View Once is now *${args.toUpperCase()}*`);
});

// Auto trigger to open view-once
module.exports = {
  name: "antivv_auto_open",
  event: "messages.upsert",
  async handler(client, update) {
    const { enabled } = getStatus();
    if (!enabled) return;

    try {
      const msg = update.messages?.[0];
      if (!msg || !msg.message) return;

      const viewOnceMsg = msg.message?.viewOnceMessageV2 || msg.message?.viewOnceMessage;
      if (!viewOnceMsg) return;

      const innerMsg = viewOnceMsg.message;
      const type = Object.keys(innerMsg || {})[0];
      if (!["imageMessage", "videoMessage"].includes(type)) return;

      const { downloadMediaMessage } = require("@whiskeysockets/baileys");
      const buffer = await downloadMediaMessage(
        { message: { message: innerMsg }, key: msg.key },
        "buffer",
        {},
        { reuploadRequest: client.updateMediaMessage }
      );

      const caption = `👀 *View Once Opened by AntiVV*\n👤 From: @${msg.key.participant?.split("@")[0] || msg.key.remoteJid.split("@")[0]}`;
      const mentionJid = [msg.key.participant || msg.key.remoteJid];

      if (type === "imageMessage") {
        await client.sendMessage(msg.key.remoteJid, { image: buffer, caption, mentions: mentionJid }, { quoted: msg });
      } else {
        await client.sendMessage(msg.key.remoteJid, { video: buffer, caption, mentions: mentionJid }, { quoted: msg });
      }
    } catch (e) {
      console.error("❌ AntiVV Error:", e);
    }
  }
};
