const { cmd } = require('../command');

const { loadSettings, saveSettings } = require('../lib/groupMessagesStorage');

// Load persistent settings.

let settings = loadSettings();
let welcomeSettings = settings.welcome || {};
let goodbyeSettings = settings.goodbye || {};

const defaultWelcomeMessage = "🎉 ᴡᴇʟᴄᴏᴍᴇ {user} ᴛᴏ {group}!\n👥 ᴍᴇᴍʙᴇʀs: {count}\n📅 {date} • 🕐 {time}\n📌 ᴅᴇsᴄʀɪᴘᴛɪᴏɴ: {desc}";
const defaultGoodbyeMessage = "👋 {user} ʟᴇғᴛ {group}.\nᴡᴇ ᴀʀᴇ ɴᴏᴡ {count} ᴍᴇᴍʙᴇʀs.";

/**
 * Replace placeholders
 */
function formatMessage(template, userMention, groupName, memberCount, groupDesc) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US');
  const timeStr = now.toLocaleTimeString('en-US');

  return template
    .replace("{user}", userMention)
    .replace("{group}", groupName)
    .replace("{count}", memberCount)
    .replace("{desc}", groupDesc)
    .replace("{date}", dateStr)
    .replace("{time}", timeStr);
}

/**
 * Welcome command
 */
cmd({
  pattern: "welcome",
  desc: "sᴇᴛ ᴏʀ ᴅɪsᴀʙʟᴇ ᴡᴇʟᴄᴏᴍᴇ ᴍᴇssᴀɢᴇs\nUsage: welcome on | welcome off | welcome <custom>",
  category: "group",
  filename: __filename,
}, async (conn, mek, m, { from, args, reply, isGroup, isBotAdmins }) => {
  try {
    if (!isGroup) return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴏɴʟʏ ᴡᴏʀᴋs ɪɴ ɢʀᴏᴜᴘs.");
    if (!isBotAdmins) return reply("❌ ɪ ɴᴇᴇᴅ ᴀᴅᴍɪɴ ᴘᴏᴡᴇʀs.");

    const setting = welcomeSettings[from] || { enabled: false, message: defaultWelcomeMessage };

    if (args.length === 0) {
      return reply(setting.enabled
        ? `✅ ᴡᴇʟᴄᴏᴍᴇ ᴇɴᴀʙʟᴇᴅ\nᴍᴇssᴀɢᴇ: ${setting.message}`
        : `❌ ᴡᴇʟᴄᴏᴍᴇ ɪs ᴏғғ`);
    }

    const option = args[0].toLowerCase();
    if (option === "on") {
      welcomeSettings[from] = { enabled: true, message: defaultWelcomeMessage };
      settings.welcome = welcomeSettings;
      saveSettings(settings);
      return reply("✅ ᴡᴇʟᴄᴏᴍᴇ ᴇɴᴀʙʟᴇᴅ ᴡɪᴛʜ ᴅᴇғᴀᴜʟᴛ ᴍᴇssᴀɢᴇ.");
    } else if (option === "off") {
      welcomeSettings[from] = { enabled: false, message: "" };
      settings.welcome = welcomeSettings;
      saveSettings(settings);
      return reply("❌ ᴡᴇʟᴄᴏᴍᴇ ᴅɪsᴀʙʟᴇᴅ.");
    } else {
      const customMsg = args.join(" ");
      welcomeSettings[from] = { enabled: true, message: customMsg };
      settings.welcome = welcomeSettings;
      saveSettings(settings);
      return reply(`✅ ᴄᴜsᴛᴏᴍ ᴍᴇssᴀɢᴇ sᴇᴛ:\n${customMsg}\n\n📌 Available placeholders:\n{user}, {group}, {count}, {desc}, {date}, {time}`);
    }
  } catch (e) {
    console.log(e);
    m.reply(`${e}`);
  }
});

/**
 * Goodbye command
 */
cmd({
  pattern: "goodbye",
  desc: "sᴇᴛ ᴏʀ ᴅɪsᴀʙʟᴇ ɢᴏᴏᴅʙʏᴇ ᴍᴇssᴀɢᴇs\nUsage: goodbye on | goodbye off | goodbye <custom>",
  category: "group",
  filename: __filename,
}, async (conn, mek, m, { from, args, reply, isGroup, isBotAdmins }) => {
  try {
    if (!isGroup) return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴏɴʟʏ ᴡᴏʀᴋs ɪɴ ɢʀᴏᴜᴘs.");
    if (!isBotAdmins) return reply("❌ ɪ ɴᴇᴇᴅ ᴀᴅᴍɪɴ ᴘᴏᴡᴇʀs.");

    const setting = goodbyeSettings[from] || { enabled: false, message: defaultGoodbyeMessage };

    if (args.length === 0) {
      return reply(setting.enabled
        ? `✅ ɢᴏᴏᴅʙʏᴇ ᴇɴᴀʙʟᴇᴅ\nᴍᴇssᴀɢᴇ: ${setting.message}`
        : `❌ ɢᴏᴏᴅʙʏᴇ ɪs ᴏғғ`);
    }

    const option = args[0].toLowerCase();
    if (option === "on") {
      goodbyeSettings[from] = { enabled: true, message: defaultGoodbyeMessage };
      settings.goodbye = goodbyeSettings;
      saveSettings(settings);
      return reply("✅ ɢᴏᴏᴅʙʏᴇ ᴇɴᴀʙʟᴇᴅ ᴡɪᴛʜ ᴅᴇғᴀᴜʟᴛ.");
    } else if (option === "off") {
      goodbyeSettings[from] = { enabled: false, message: "" };
      settings.goodbye = goodbyeSettings;
      saveSettings(settings);
      return reply("❌ ɢᴏᴏᴅʙʏᴇ ᴅɪsᴀʙʟᴇᴅ.");
    } else {
      const customMsg = args.join(" ");
      goodbyeSettings[from] = { enabled: true, message: customMsg };
      settings.goodbye = goodbyeSettings;
      saveSettings(settings);
      return reply(`✅ ᴄᴜsᴛᴏᴍ ᴍᴇssᴀɢᴇ sᴇᴛ:\n${customMsg}\n\n📌 Available placeholders:\n{user}, {group}, {count}, {desc}, {date}, {time}`);
    }
  } catch (e) {
    console.log(e);
    m.reply(`${e}`);
  }
});

/**
 * Event registration
 */
function registerGroupMessages(conn) {
  conn.ev.on("group-participants.update", async (update) => {
    const groupId = update.id;
    let groupMetadata;

    try {
      groupMetadata = await conn.groupMetadata(groupId);
    } catch (e) {
      console.error("❌ Group metadata error:", e);
    }

    const groupName = groupMetadata?.subject || "Group";
    const memberCount = groupMetadata?.participants?.length || 0;
    const groupDesc = groupMetadata?.desc || "No description.";

    for (let participant of update.participants) {
      const mention = `@${participant.split("@")[0]}`;
      let dpUrl = "";

      try {
        dpUrl = await conn.profilePictureUrl(participant, "image");
      } catch {
        dpUrl = "https://files.catbox.moe/49gzva.png";
      }

      if (update.action === "add") {
        const setting = welcomeSettings[groupId];
        if (setting?.enabled) {
          const msg = formatMessage(setting.message || defaultWelcomeMessage, mention, groupName, memberCount, groupDesc);
          await conn.sendMessage(groupId, { image: { url: dpUrl }, caption: msg, mentions: [participant] });
        }
      }

      if (update.action === "remove") {
        const setting = goodbyeSettings[groupId];
        if (setting?.enabled) {
          const msg = formatMessage(setting.message || defaultGoodbyeMessage, mention, groupName, memberCount, groupDesc);
          await conn.sendMessage(groupId, { image: { url: dpUrl }, caption: msg, mentions: [participant] });
        }
      }
    }
  });
}

module.exports = { registerGroupMessages };
