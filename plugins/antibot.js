const { cmd } = require('../command');

let antiBotEnabled = false;

// Command to enable or disable the anti-bot feature

cmd({

  pattern: "antibot",

  alias: ["botfilter"],

  desc: "Enable or disable the anti-bot system.",

  category: "settings",

  react: "🤖",

  filename: __filename

}, async (conn, m, msg, { text }) => {

  if (!text) return m.reply("*Usage:* .antibot on | off");

  if (text.toLowerCase() === "on") {

    antiBotEnabled = true;

    return m.reply("*✅ Anti-Bot has been enabled.*");

  } else if (text.toLowerCase() === "off") {

    antiBotEnabled = false;

    return m.reply("*❌ Anti-Bot has been disabled.*");

  } else {

    return m.reply("*Usage:* .antibot on | off");

  }

});

// Monitor group participant updates

cmd({ on: "group-participants.update" }, async (conn, m) => {

  try {

    if (!antiBotEnabled) return;

    const participants = m.participants || [];

    const groupId = m.id;

    for (const jid of participants) {

      // If the user JID contains "bot", remove them

      if (jid.toLowerCase().includes("bot")) {

        await conn.groupParticipantsUpdate(groupId, [jid], "remove");

        await conn.sendMessage(groupId, {

          text: `*🤖 Removed member ${jid} — detected as a bot.*`,

          mentions: [jid]

        });

      }

    }

  } catch (err) {

    console.error("Anti-Bot Error:", err);

  }

});