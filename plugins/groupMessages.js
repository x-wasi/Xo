const { cmd } = require('../command');
const { loadSettings, saveSettings } = require('../lib/groupMessagesStorage');
const { defaultWelcomeMessage, defaultGoodbyeMessage } = require('../lib/groupevents');

let settings = loadSettings();
let welcomeSettings = settings.welcome || {};
let goodbyeSettings = settings.goodbye || {};

// .welcome
cmd({
  pattern: "welcome",
  desc: "Set custom welcome message for group\nUsage: .welcome on | .welcome off | .welcome <custom message>\nPlaceholders: {user}, {group}, {count}, {desc}, {date}, {time}",
  category: "group",
  filename: __filename,
}, async (conn, mek, m, { from, args, reply, isGroup, isBotAdmins }) => {
  if (!isGroup) return reply("❌ This command only works in group chats.");
  if (!isBotAdmins) return reply("❌ I must be admin to set welcome messages.");

  const setting = welcomeSettings[from] || { enabled: false, message: defaultWelcomeMessage };

  if (args.length === 0) {
    return reply(setting.enabled
      ? `✅ Welcome is enabled.\n\nMessage:\n${setting.message}`
      : `❌ Welcome is disabled.`);
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
    const customMessage = args.join(" ");
    welcomeSettings[from] = { enabled: true, message: customMessage };
    settings.welcome = welcomeSettings;
    saveSettings(settings);
    return reply(`✅ Custom welcome message saved:\n\n${customMessage}\n\n📌 Placeholders:\n{user}, {group}, {count}, {desc}, {date}, {time}`);
  }
});

// .goodbye
cmd({
  pattern: "goodbye",
  desc: "Set custom goodbye message for group\nUsage: .goodbye on | .goodbye off | .goodbye <custom message>\nPlaceholders: {user}, {group}, {count}, {desc}, {date}, {time}",
  category: "group",
  filename: __filename,
}, async (conn, mek, m, { from, args, reply, isGroup, isBotAdmins }) => {
  if (!isGroup) return reply("❌ This command only works in group chats.");
  if (!isBotAdmins) return reply("❌ I must be admin to set goodbye messages.");

  const setting = goodbyeSettings[from] || { enabled: false, message: defaultGoodbyeMessage };

  if (args.length === 0) {
    return reply(setting.enabled
      ? `✅ Goodbye is enabled.\n\nMessage:\n${setting.message}`
      : `❌ Goodbye is disabled.`);
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
    const customMessage = args.join(" ");
    goodbyeSettings[from] = { enabled: true, message: customMessage };
    settings.goodbye = goodbyeSettings;
    saveSettings(settings);
    return reply(`✅ Custom goodbye message saved:\n\n${customMessage}\n\n📌 Placeholders:\n{user}, {group}, {count}, {desc}, {date}, {time}`);
  }
});
