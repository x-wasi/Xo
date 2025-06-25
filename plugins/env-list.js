const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');
const config = require('../config');

const envFilePath = path.resolve('config.env');

const toggleOptions = [
  {
    key: "PUBLIC_MODE",
    label: "Public Mode",
    messages: {
      true: "✅ Bot is now in public mode.",
      false: "❌ Bot has exited public mode."
    }
  },
  {
    key: "ALWAYS_ONLINE",
    label: "Always Online",
    messages: {
      true: "✅ Bot will now always appear online.",
      false: "❌ Bot will no longer appear always online."
    }
  },
  {
    key: "READ_MESSAGE",
    label: "Read Messages",
    messages: {
      true: "✅ Auto-reading of messages enabled.",
      false: "❌ Auto-reading of messages disabled."
    }
  },
  {
    key: "READ_CMD",
    label: "Read Commands",
    messages: {
      true: "✅ Command read feature enabled.",
      false: "❌ Command read feature disabled."
    }
  },
  {
    key: "AUTO_REPLY",
    label: "Auto Reply",
    messages: {
      true: "✅ Auto reply enabled.",
      false: "❌ Auto reply disabled."
    }
  },
  {
    key: "AUTO_REACT",
    label: "Auto React",
    messages: {
      true: "✅ Auto reactions enabled.",
      false: "❌ Auto reactions disabled."
    }
  },
  {
    key: "CUSTOM_REACT",
    label: "Custom React",
    messages: {
      true: "✅ Custom emoji reactions enabled.",
      false: "❌ Custom emoji reactions disabled."
    }
  },
  {
    key: "AUTO_STICKER",
    label: "Auto Sticker",
    messages: {
      true: "✅ Auto sticker replies enabled.",
      false: "❌ Auto sticker replies disabled."
    }
  },
  {
    key: "AUTO_VOICE",
    label: "Auto Voice",
    messages: {
      true: "✅ Auto voice replies enabled.",
      false: "❌ Auto voice replies disabled."
    }
  },
  {
    key: "AUTO_STATUS_SEEN",
    label: "Status Seen",
    messages: {
      true: "✅ Auto status seen enabled.",
      false: "❌ Auto status seen disabled."
    }
  },
  {
    key: "AUTO_STATUS_REPLY",
    label: "Status Reply",
    messages: {
      true: "✅ Auto status reply enabled.",
      false: "❌ Auto status reply disabled."
    }
  },
  {
    key: "AUTO_STATUS_REACT",
    label: "Status React",
    messages: {
      true: "✅ Auto status reaction enabled.",
      false: "❌ Auto status reaction disabled."
    }
  },
  {
    key: "ANTI_LINK",
    label: "Anti-Link",
    messages: {
      true: "✅ Anti-link enabled in groups.",
      false: "❌ Anti-link disabled."
    }
  },
  {
    key: "ANTI_BAD",
    label: "Anti-Bad Words",
    messages: {
      true: "✅ Bad word filtering enabled.",
      false: "❌ Bad word filtering disabled."
    }
  },
  {
    key: "ANTI_VV",
    label: "Anti View Once",
    messages: {
      true: "✅ Anti-ViewOnce enabled.",
      false: "❌ Anti-ViewOnce disabled."
    }
  },
  {
    key: "DELETE_LINKS",
    label: "Delete Links",
    messages: {
      true: "✅ Auto link deletion enabled.",
      false: "❌ Auto link deletion disabled."
    }
  },
  {
    key: "AUTO_TYPING",
    label: "Auto Typing",
    messages: {
      true: "✅ Typing status enabled.",
      false: "❌ Typing status disabled."
    }
  },
  {
    key: "AUTO_RECORDING",
    label: "Auto Recording",
    messages: {
      true: "✅ Recording status enabled.",
      false: "❌ Recording status disabled."
    }
  }
];

function isEnabled(value) {
  return value && value.toString().toLowerCase() === "true";
}

function updateEnvVariable(key, value) {
  let envContent = fs.readFileSync(envFilePath, 'utf8');
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, `${key}=${value}`);
  } else {
    envContent += `\n${key}=${value}`;
  }
  fs.writeFileSync(envFilePath, envContent);
}

cmd({
  pattern: "env",
  alias: ["config", "setting"],
  desc: "Show & update .env configuration",
  category: "settings",
  react: "⚙️",
  filename: __filename
}, async (conn, mek, m, { from, reply, isOwner }) => {
  if (!isOwner) return reply("🚫 *Owner Only Command!*");

  let caption = `╭───『 *DYBYTECH BOT SETTINGS* 』───❏\n`;
  toggleOptions.forEach((opt, i) => {
    const val = config[opt.key];
    caption += `│ ${i + 1}. *${opt.label}:* ${isEnabled(val) ? "✅" : "❌"}   \`(${i + 1}.1 = ON | ${i + 1}.2 = OFF)\`\n`;
  });
  caption += `│\n│ _Reply with x.1 to enable or x.2 to disable_\n╰───❏`;

  const sentMsg = await conn.sendMessage(from, {
    image: { url: 'https://files.catbox.moe/frns4k.jpg' },
    caption
  }, { quoted: mek });

  const messageID = sentMsg.key.id;

  const handler = async ({ messages }) => {
    const msg = messages[0];
    if (!msg?.message || msg.key.remoteJid !== from) return;

    const replyID =
      msg.message?.extendedTextMessage?.contextInfo?.stanzaId ||
      msg.message?.contextInfo?.stanzaId;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    if (!text || replyID !== messageID) return;

    const match = /^(\d+)\.(1|2)$/.exec(text.trim());
    if (!match) {
      return conn.sendMessage(from, {
        text: "❌ Invalid format. Use `1.1` to enable or `1.2` to disable.",
      }, { quoted: msg });
    }

    const index = parseInt(match[1]) - 1;
    const newValue = match[2] === '1' ? 'true' : 'false';
    const option = toggleOptions[index];

    if (!option) {
      return conn.sendMessage(from, {
        text: "❌ Invalid option number.",
      }, { quoted: msg });
    }

    updateEnvVariable(option.key, newValue);
    config[option.key] = newValue;

    return conn.sendMessage(from, {
      text: option.messages[newValue] || `✅ ${option.label} updated.`,
    }, { quoted: msg });
  };

  conn.ev.on("messages.upsert", handler);

  // Optional: remove listener after 5 minutes to avoid memory leak
  setTimeout(() => {
    conn.ev.off("messages.upsert", handler);
  }, 300000);
});