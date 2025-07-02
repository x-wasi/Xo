const { cmd } = require('../command');
const { loadSettings, saveSettings } = require('../lib/groupMessagesStorage');

let settings = loadSettings();

let welcomeSettings = settings.welcome || {};
let goodbyeSettings = settings.goodbye || {};

const defaultWelcomeMessage = "Welcome {user} to {group}!\n📅 {date} ⏰ {time}\n👥 Members: {count}\n📝 {desc}";
const defaultGoodbyeMessage = "Goodbye {user} from {group}.\n📅 {date} ⏰ {time}\n👥 Members left: {count}\n📝 {desc}";

function formatMessage(template, userMention, groupName, extras = {}) {
  return template
    .replace(/{user}/g, userMention)
    .replace(/{group}/g, groupName)
    .replace(/{date}/g, extras.date || "")
    .replace(/{time}/g, extras.time || "")
    .replace(/{count}/g, extras.count || "")
    .replace(/{desc}/g, extras.desc || "");
}

// === Command: welcome ===
cmd({
  pattern: "welcome",
  desc: "Set or disable the welcome message for new members.\nUsage: welcome on | off | <custom message>",
  category: "group",
  filename: __filename,
}, async (conn, mek, m, { from, args, reply, isGroup, isBotAdmins }) => {
  if (!isGroup) return reply("This command can only be used in groups.");
  if (!isBotAdmins) return reply("I'm not admin.");

  if (args.length === 0) {
    const setting = welcomeSettings[from];
    return reply(setting && setting.enabled
      ? `✅ Welcome is *ON*\n📩 Message:\n${setting.message}`
      : "❌ Welcome is *OFF*.");
  }

  const option = args[0].toLowerCase();

  if (option === "on") {
    welcomeSettings[from] = { enabled: true, message: defaultWelcomeMessage };
    settings.welcome = welcomeSettings;
    saveSettings(settings);
    return reply("✅ Welcome enabled with default message.");
  } else if (option === "off") {
    welcomeSettings[from] = { enabled: false, message: "" };
    settings.welcome = welcomeSettings;
    saveSettings(settings);
    return reply("❌ Welcome disabled.");
  } else {
    const customMsg = args.join(" ");
    welcomeSettings[from] = { enabled: true, message: customMsg };
    settings.welcome = welcomeSettings;
    saveSettings(settings);
    return reply(`✅ Custom welcome message set:\n${customMsg}`);
  }
});

// === Command: goodbye ===
cmd({
  pattern: "goodbye",
  desc: "Set or disable the goodbye message for members who leave.\nUsage: goodbye on | off | <custom message>",
  category: "group",
  filename: __filename,
}, async (conn, mek, m, { from, args, reply, isGroup, isBotAdmins }) => {
  if (!isGroup) return reply("This command can only be used in groups.");
  if (!isBotAdmins) return reply("I'm not admin.");

  if (args.length === 0) {
    const setting = goodbyeSettings[from];
    return reply(setting && setting.enabled
      ? `✅ Goodbye is *ON*\n📩 Message:\n${setting.message}`
      : "❌ Goodbye is *OFF*.");
  }

  const option = args[0].toLowerCase();

  if (option === "on") {
    goodbyeSettings[from] = { enabled: true, message: defaultGoodbyeMessage };
    settings.goodbye = goodbyeSettings;
    saveSettings(settings);
    return reply("✅ Goodbye enabled with default message.");
  } else if (option === "off") {
    goodbyeSettings[from] = { enabled: false, message: "" };
    settings.goodbye = goodbyeSettings;
    saveSettings(settings);
    return reply("❌ Goodbye disabled.");
  } else {
    const customMsg = args.join(" ");
    goodbyeSettings[from] = { enabled: true, message: customMsg };
    settings.goodbye = goodbyeSettings;
    saveSettings(settings);
    return reply(`✅ Custom goodbye message set:\n${customMsg}`);
  }
});

// === Group Event Listener ===
function registerGroupMessages(conn) {
  conn.ev.on("group-participants.update", async (update) => {
    const groupId = update.id;
    let groupMetadata;

    try {
      groupMetadata = await conn.groupMetadata(groupId);
    } catch (e) {
      console.error("Group metadata error:", e);
    }

    const groupName = groupMetadata?.subject || "this group";
    const groupDesc = groupMetadata?.desc || "No description";
    const memberCount = groupMetadata?.participants?.length || "N/A";

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
          let pp = "";
          try {
            pp = await conn.profilePictureUrl(participant, "image");
          } catch {
            pp = "https://files.catbox.moe/49gzva.png";
          }

          const mention = `@${participant.split("@")[0]}`;
          const message = formatMessage(setting.message || defaultMsg, mention, groupName, {
            date, time, count: memberCount, desc: groupDesc
          });

          await conn.sendMessage(groupId, {
            image: { url: pp },
            caption: message,
            mentions: [participant]
          });
        }
      }
    }

    // Promote/Demote logic (facultatif, inchangé)
    if (update.action === "promote" || update.action === "demote") {
      for (let participant of update.participants) {
        const msg = update.action === "promote"
          ? `Hey @${participant.split("@")[0]}, you're now an admin! 🎉`
          : `@${participant.split("@")[0]}, you've been demoted. 😔`;
        await conn.sendMessage(groupId, {
          text: msg,
          mentions: [participant],
        });
      }
    }
  });
}

module.exports = { registerGroupMessages };
