const fs = require('fs');
const path = require("path");
const { cmd } = require("../command");
const config = require('../config');
const { runtime } = require("../lib/functions");
const prefix = config.PREFIX;

const MENTION_JSON = path.join(__dirname, '../lib/mentionbot.json');

// Get mention settings
function getMentionBotSettings() {
  if (fs.existsSync(MENTION_JSON)) {
    try {
      return JSON.parse(fs.readFileSync(MENTION_JSON, "utf8"));
    } catch (e) {
      console.log("❌ JSON Parse Error:", e);
      return null;
    }
  }
  return null;
}

// Save mention settings
function setMentionBotSettings(url, msg) {
  fs.writeFileSync(MENTION_JSON, JSON.stringify({ url, msg }, null, 2));
}

// Auto reply when bot is mentioned
cmd({
  on: "body"
}, async (conn, m, { isGroup }) => {
  try {
    if (config.MENTION_REPLY !== 'true' || !isGroup) return;

    const mentioned = m.mentionedJid || [];
    const botNumber = conn.user.id.split(":")[0] + '@s.whatsapp.net';
    if (!mentioned.includes(botNumber)) return;

    const settings = getMentionBotSettings();
    if (!settings || !settings.url || !settings.msg) return;

    const responseText = settings.msg
      .replace(/{runtime}/gi, runtime(process.uptime()))
      .replace(/@user/gi, `@${m.sender.split("@")[0]}`);

    const mediaUrl = settings.url;
    const isVideo = /\.(mp4|mov|webm|mkv)$/i.test(mediaUrl);
    const isAudio = /\.(mp3|wav|m4a|opus)$/i.test(mediaUrl);

    if (isAudio) {
      await conn.sendMessage(m.chat, {
        audio: { url: mediaUrl },
        mimetype: 'audio/mp4',
        ptt: true,
        contextInfo: { forwardingScore: 999, isForwarded: true }
      }, { quoted: m });
    } else {
      const content = isVideo
        ? { video: { url: mediaUrl }, caption: responseText }
        : { image: { url: mediaUrl }, caption: responseText };

      await conn.sendMessage(m.chat, content, {
        quoted: m,
        contextInfo: {
          mentionedJid: [m.sender]
        }
      });
    }

  } catch (err) {
    console.error("MentionBot Error:", err);
  }
});

// Command to set mention bot reply
cmd({
  pattern: "setmentionbot",
  desc: "Set media and message for when someone mentions the bot.\nUsage: <url> | <message>",
  category: "owner",
  filename: __filename
}, async (conn, q, m, { from, args, isOwner, reply, prefix }) => {
  console.log("✅ setmentionbot triggered");

  if (!isOwner) {
    return await conn.sendMessage(from, { text: "❌ Only the bot owner can use this command." }, { quoted: m });
  }

  const input = args.join(" ");
  if (!input.includes('|')) {
    return await conn.sendMessage(from, {
      text: `❌ ᴜsᴀɢᴇ: ${prefix} setmentionbot <media URL> | <message>\nExample: ${prefix} setmentionbot https://example.com/audio.mp3 | Hello @user! Bot uptime: {runtime}`
    }, { quoted: m });
  }

  const [url, ...captionParts] = input.split('|');
  const caption = captionParts.join('|').trim();

  if (!url.trim() || !caption) {
    return await conn.sendMessage(from, {
      text: `❌ ʙᴏᴛʜ ᴍᴇᴅɪᴀ ᴜʀʟ ᴀɴᴅ ᴍᴇssᴀɢᴇ ᴀʀᴇ ʀᴇǫᴜɪʀᴇᴅ.`
    }, { quoted: m });
  }

  setMentionBotSettings(url.trim(), caption);
  await conn.sendMessage(from, { text: "✅ Mention reply media and message saved successfully!" }, { quoted: m });
});
