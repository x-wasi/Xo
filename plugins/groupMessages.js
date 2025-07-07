const { cmd } = require('../command');
const { loadSettings, saveSettings } = require('../lib/groupMessagesStorage');

let settings = loadSettings();
let welcomeSettings = settings.welcome || {};
let goodbyeSettings = settings.goodbye || {};

const defaultWelcomeMessage = "👋 ᴡᴇʟᴄᴏᴍᴇ {user} ᴛᴏ {group}!\n📅 {date} ⏰ {time}\n👥 ᴍᴇᴍʙᴇʀs: {count}\n📝 {desc}";
const defaultGoodbyeMessage = "👋 ɢᴏᴏᴅʙʏᴇ {user} ғʀᴏᴍ {group}.\n📅 {date} ⏰ {time}\n👥 ᴍᴇᴍʙᴇʀs left: {count}\n📝 {desc}";

function formatMessage(template, userMention, groupName, extras = {}) {
  return template
    .replace(/{user}/g, userMention)
    .replace(/{group}/g, groupName)
    .replace(/{date}/g, extras.date || "")
    .replace(/{time}/g, extras.time || "")
    .replace(/{count}/g, extras.count || "")
    .replace(/{desc}/g, extras.desc || "");
}

// === .welcome command ===
cmd({
  pattern: "welcome",
  desc: "Enable/disable or customize welcome message\nUsage: welcome on | off | <message>",
  category: "group",
  filename: __filename,
}, async (conn, mek, m, { from, args, reply, isGroup, isBotAdmins, isOwner }) => {
  if (!isGroup) return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ғᴏʀ ɢʀᴏᴜᴘs ᴏɴʟʏ.");
  if (!isBotAdmins) return reply("❌ ɪ ᴍᴜsᴛ ʙᴇ ᴀᴅᴍɪɴ ᴛᴏ ᴍᴀɴᴀɢᴇ ᴡᴇʟᴄᴏᴍᴇ ᴍᴇssᴀɢᴇs.");
  if (!isOwner) return reply("❌ ᴏɴʟʏ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴍᴏᴅɪғʏ ᴡᴇʟᴄᴏᴍᴇ sᴇᴛᴛɪɴɢs.");

  if (args.length === 0) {
    const setting = welcomeSettings[from];
    return reply(setting && setting.enabled
      ? `✅ Welcome is *ON*\n📝 Message:\n${setting.message}`
      : "❌ Welcome is *OFF*.");
  }

  const option = args[0].toLowerCase();

  if (option === "on") {
    welcomeSettings[from] = { enabled: true, message: defaultWelcomeMessage };
  } else if (option === "off") {
    welcomeSettings[from] = { enabled: false, message: "" };
  } else {
    const customMsg = args.join(" ");
    welcomeSettings[from] = { enabled: true, message: customMsg };
  }

  settings.welcome = welcomeSettings;
  saveSettings(settings);

  reply(option === "off"
    ? "❌ Welcome message disabled."
    : `✅ Welcome message ${option === "on" ? "enabled" : "set with custom text"}:\n${welcomeSettings[from].message}`);
});

// === .goodbye command ===
cmd({
  pattern: "goodbye",
  desc: "Enable/disable or customize goodbye message\nUsage: goodbye on | off | <message>",
  category: "group",
  filename: __filename,
}, async (conn, mek, m, { from, args, reply, isGroup, isBotAdmins, isOwner }) => {
  if (!isGroup) return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ is ғᴏʀ ɢʀᴏᴜᴘs ᴏɴʟʏ.");
  if (!isBotAdmins) return reply("❌ ɪ ᴍᴜsᴛ ʙᴇ ᴀᴅᴍɪɴ ᴛᴏ ᴍᴀɴᴀɢᴇ ɢᴏᴏᴅʙʏᴇ ᴍᴇssᴀɢᴇs.");
  if (!isOwner) return reply("❌ ᴏɴʟʏ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴍᴏᴅɪғʏ ɢᴏᴏᴅʙʏᴇ sᴇᴛᴛɪɴɢs.");

  if (args.length === 0) {
    const setting = goodbyeSettings[from];
    return reply(setting && setting.enabled
      ? `✅ Goodbye is *ON*\n📝 Message:\n${setting.message}`
      : "❌ Goodbye is *OFF*.");
  }

  const option = args[0].toLowerCase();

  if (option === "on") {
    goodbyeSettings[from] = { enabled: true, message: defaultGoodbyeMessage };
  } else if (option === "off") {
    goodbyeSettings[from] = { enabled: false, message: "" };
  } else {
    const customMsg = args.join(" ");
    goodbyeSettings[from] = { enabled: true, message: customMsg };
  }

  settings.goodbye = goodbyeSettings;
  saveSettings(settings);

  reply(option === "off"
    ? "❌ Goodbye message disabled."
    : `✅ Goodbye message ${option === "on" ? "enabled" : "set with custom text"}:\n${goodbyeSettings[from].message}`);
});

// === Group Join/Leave Events ===
function registerGroupMessages(conn) {
  conn.ev.on("group-participants.update", async (update) => {
    const groupId = update.id;
    let groupMetadata;

    try {
      groupMetadata = await conn.groupMetadata(groupId);
    } catch (e) {
      console.error("Group metadata fetch error:", e);
      return;
    }

    const groupName = groupMetadata.subjeᴏɴʟʏ| "this group";
    const groupDesc = groupMetadata.desc || "No description";
    const memberCount = groupMetadata.participants?.length || "N/A";

    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString("en-US");

    const actionMap = {
      "add": {
        setting: welcomeSettings[groupId],
        defaultMsg: defaultWelcomeMessage,
      },
      "remove": {
        setting: goodbyeSettings[groupId],
        defaultMsg: defaultGoodbyeMessage,
      },
    };

    if (actionMap[update.action]) {
      for (const participant of update.participants) {
        const { setting, defaultMsg } = actionMap[update.action];
        if (setting && setting.enabled) {
          let pp = "https://files.catbox.moe/49gzva.png";
          try {
            pp = await conn.profilePictureUrl(participant, "image");
          } catch {}

          const mention = `@${participant.split("@")[0]}`;
          const message = formatMessage(setting.message || defaultMsg, mention, groupName, {
            date, time, count: memberCount, desc: groupDesc,
          });

          await conn.sendMessage(groupId, {
            image: { url: pp },
            caption: message,
            mentions: [participant],
          });
        }
      }
    }

    // Optional: Admin promote/demote message
    if (update.action === "promote" || update.action === "demote") {
      for (let participant of update.participants) {
        const msg = update.action === "promote"
          ? `🎉 @${participant.split("@")[0]} ɪs ɴᴏᴡ ᴀɴ ᴀᴅᴍɪɴ!`
          : `😔 @${participant.split("@")[0]} ɪs ɴᴏ ʟᴏɴɢᴇʀ ᴀᴅᴍɪɴ.`;
        await conn.sendMessage(groupId, {
          text: msg,
          mentions: [participant],
        });
      }
    }
  });
}

module.exports = { registerGroupMessages };
