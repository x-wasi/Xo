const { cmd } = require('../command');
const { loadSettings, saveSettings } = require('../lib/groupMessagesStorage');
const { defaultWelcomeMessage, defaultGoodbyeMessage } = require('../lib/groupevents');

let settings = loadSettings();
let welcomeSettings = settings.welcome || {};
let goodbyeSettings = settings.goodbye || {};

// Commande: .welcome
cmd({
  pattern: "welcome",
  desc: "Set custom welcome message for group\nUsage: welcome on | welcome off | welcome <custom message>\nAvailable placeholders: {user}, {group}, {count}, {desc}, {date}, {time}",
  category: "group",
  filename: __filename,
}, async (conn, mek, m, { from, args, reply, isGroup, isBotAdmins }) => {
  if (!isGroup) return reply("❌ This command can only be used in groups.");
  if (!isBotAdmins) return reply("❌ I need to be an admin to set welcome messages.");

  // Récupération de la configuration actuelle ou du message par défaut
  const setting = welcomeSettings[from] || { enabled: false, message: defaultWelcomeMessage };

  if (args.length === 0) {
    return reply(setting.enabled
      ? `✅ Welcome is enabled.\n\nMessage:\n${setting.message}`
      : `❌ Welcome is currently disabled.`);
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
    // Personnalisation
    const customMessage = args.join(" ");
    welcomeSettings[from] = { enabled: true, message: customMessage };
    settings.welcome = welcomeSettings;
    saveSettings(settings);
    return reply(`✅ Custom welcome message set:\n\n${customMessage}\n\nAvailable placeholders:\n{user}, {group}, {count}, {desc}, {date}, {time}`);
  }
});

// Commande: .goodbye
cmd({
  pattern: "goodbye",
  desc: "Set custom goodbye message for group\nUsage: goodbye on | goodbye off | goodbye <custom message>\nAvailable placeholders: {user}, {group}, {count}, {desc}, {date}, {time}",
  category: "group",
  filename: __filename,
}, async (conn, mek, m, { from, args, reply, isGroup, isBotAdmins }) => {
  if (!isGroup) return reply("❌ This command can only be used in groups.");
  if (!isBotAdmins) return reply("❌ I need to be an admin to set goodbye messages.");

  // Récupération de la configuration actuelle ou du message par défaut
  const setting = goodbyeSettings[from] || { enabled: false, message: defaultGoodbyeMessage };

  if (args.length === 0) {
    return reply(setting.enabled
      ? `✅ Goodbye is enabled.\n\nMessage:\n${setting.message}`
      : `❌ Goodbye is currently disabled.`);
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
    // Personnalisation
    const customMessage = args.join(" ");
    goodbyeSettings[from] = { enabled: true, message: customMessage };
    settings.goodbye = goodbyeSettings;
    saveSettings(settings);
    return reply(`✅ Custom goodbye message set:\n\n${customMessage}\n\nAvailable placeholders:\n{user}, {group}, {count}, {desc}, {date}, {time}`);
  }
});
