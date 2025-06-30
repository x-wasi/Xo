const { cmd } = require('../command');

const { loadSettings, saveSettings } = require('../lib/groupMessagesStorage');

// Load persistent settings.

let settings = loadSettings();

let welcomeSettings = settings.welcome || {};   // { groupJid: { enabled: true/false, message: "custom text" } }

let goodbyeSettings = settings.goodbye || {};   // { groupJid: { enabled: true/false, message: "custom text" } }

/**

 * Default messages (using placeholders):

 * {user} – will be replaced by the mention (e.g. @username)

 * {group} – will be replaced by the group name

 */

const defaultWelcomeMessage = "ᴡᴇʟᴄᴏᴍᴇ {user} ᴛᴏ {group}! ᴡᴇ'ʀᴇ ɢʟᴀᴅ ᴛᴏ ʜᴀᴠᴇ ʏᴏᴜ ʜᴇʀᴇ.";

const defaultGoodbyeMessage = "ɢᴏᴏᴅʙʏᴇ {user}. ᴡᴇ'ʟʟ ᴍɪss ʏᴏᴜ ɪɴ {group}.";

/**

 * Replace placeholders in the message template.

 */

function formatMessage(template, userMention, groupName) {

  return template.replace("{user}", userMention).replace("{group}", groupName);

}

/**

 * Command: welcome

 * Usage:

 *   - "welcome on" : Enables welcome messages with the default message.

 *   - "welcome off": Disables welcome messages.

 *   - "welcome <custom message>" : Sets a custom welcome message.

 */

cmd(

  {

    pattern: "welcome",

    desc: "sᴇᴛ ᴏʀ ᴅɪsᴀʙʟᴇ the welcome message for new members.\nUsage: ᴡᴇʟᴄᴏᴍᴇ ᴏɴ | ᴡᴇʟᴄᴏᴍᴇ ᴏғғ | ᴡᴇʟᴄᴏᴍᴇ <ᴄᴜsᴛᴏᴍ ᴍᴇssᴀɢᴇ>",

    category: "group",

    filename: __filename,

  },

  async (conn, mek, m, { from, args, reply, isGroup, isBotAdmins }) => {

    try {

      if (!isGroup) return reply("ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs.");

      if (!isBotAdmins) return reply("ɪ'ᴍ ɴᴏᴛ ᴀᴅᴍɪɴ.");

      if (args.length === 0) {

        const setting = welcomeSettings[from];

        if (setting && setting.enabled) {

          return reply(`ᴡᴇʟᴄᴏᴍᴇ ᴍᴇssᴀɢᴇs ᴀʀᴇ ON.\nCustom message: ${setting.message}`);

        } else {

          return reply("Welcome messages are OFF.");

        }

      }

      const option = args[0].toLowerCase();

      if (option === "on") {

        welcomeSettings[from] = { enabled: true, message: defaultWelcomeMessage };

        settings.welcome = welcomeSettings;

        saveSettings(settings);

        return reply("ᴡᴇʟᴄᴏᴍᴇ ᴍᴇssᴀɢᴇs ᴇɴᴀʙʟᴇᴅ ᴡɪᴛʜ ᴅᴇғᴀᴜʟᴛ ᴍᴇssᴀɢᴇ.");

      } else if (option === "off") {

        welcomeSettings[from] = { enabled: false, message: "" };

        settings.welcome = welcomeSettings;

        saveSettings(settings);

        return reply("Welcome messages disabled.");

      } else {

        // Treat the entire arguments as the custom message.

        const customMsg = args.join(" ");

        welcomeSettings[from] = { enabled: true, message: customMsg };

        settings.welcome = welcomeSettings;

        saveSettings(settings);

        return reply(`Custom welcome message set:\n${customMsg}`);

      }

    } catch (e) {

      console.log(e);

      m.reply(`${e}`);

    }

  }

);

/**

 * Command: goodbye

 * Usage:

 *   - "goodbye on" : Enables goodbye messages with the default message.

 *   - "goodbye off": Disables goodbye messages.

 *   - "goodbye <custom message>" : Sets a custom goodbye message.

 */

cmd(

  {

    pattern: "goodbye",

    desc: "sᴇᴛ ᴏʀ ᴅɪsᴀʙʟᴇ ᴛʜᴇ ɢᴏᴏᴅʙʏᴇ ᴍᴇssᴀɢᴇ ғᴏʀ ᴅᴇᴘᴀʀᴛɪɴɢ ᴍᴇᴍʙᴇʀs.\nUsage: ɢᴏᴏᴅʙʏᴇ ᴏɴ | ɢᴏᴏᴅʙʏᴇ ᴏғғ | ɢᴏᴏᴅʙʏᴇ <ᴄᴜsᴛᴏᴍ ᴍᴇssᴀɢᴇ>",

    category: "group",

    filename: __filename,

  },

  async (conn, mek, m, { from, args, reply, isGroup, isBotAdmins }) => {

    try {

      if (!isGroup) return reply("ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs.");

      if (!isBotAdmins) return reply("ɪ'ᴍ ɴᴏᴛ ᴀᴅᴍɪɴ.");

      if (args.length === 0) {

        const setting = goodbyeSettings[from];

        if (setting && setting.enabled) {

          return reply(`ɢᴏᴏᴅʙʏᴇ ᴍᴇssᴀɢᴇs ᴀʀᴇ ᴏɴ.\nᴄᴜsᴛᴏᴍ ᴍᴇssᴀɢᴇ: ${setting.message}`);

        } else {

          return reply("ɢᴏᴏᴅʙʏᴇ ᴍᴇssᴀɢᴇs ᴀʀᴇ ᴏғғ.");

        }

      }

      const option = args[0].toLowerCase();

      if (option === "on") {

        goodbyeSettings[from] = { enabled: true, message: defaultGoodbyeMessage };

        settings.goodbye = goodbyeSettings;

        saveSettings(settings);

        return reply("ɢᴏᴏᴅʙʏᴇ ᴍᴇssᴀɢᴇs ᴇɴᴀʙʟᴇᴅ ᴡɪᴛʜ ᴅᴇғᴀᴜʟᴛ ᴍᴇssᴀɢᴇ.");

      } else if (option === "off") {

        goodbyeSettings[from] = { enabled: false, message: "" };

        settings.goodbye = goodbyeSettings;

        saveSettings(settings);

        return reply("Goodbye messages disabled.");

      } else {

        const customMsg = args.join(" ");

        goodbyeSettings[from] = { enabled: true, message: customMsg };

        settings.goodbye = goodbyeSettings;

        saveSettings(settings);

        return reply(`Custom goodbye message set:\n${customMsg}`);

      }

    } catch (e) {

      console.log(e);

      m.reply(`${e}`);

    }

  }

);

/**

 * Listen for group-participants update events.

 * This handler processes new members, departures, and admin changes.

 */

function registerGroupMessages(conn) {

  // Listen for participant updates.

  conn.ev.on("group-participants.update", async (update) => {

    const groupId = update.id;

    let groupMetadata = null;

    try {

      groupMetadata = await conn.groupMetadata(groupId);

    } catch (error) {

      console.error("Error fetching group metadata:", error);

    }

    const groupName = groupMetadata ? groupMetadata.subject : "this group";

    // Welcome new participants.

    if (update.action === "add") {

      for (let participant of update.participants) {

        const setting = welcomeSettings[groupId];

        if (setting && setting.enabled) {

          let dpUrl = "";

          try {

            dpUrl = await conn.profilePictureUrl(participant, "image");

          } catch (error) {

            dpUrl = "https://files.catbox.moe/49gzva.png"; // fallback image URL

          }

          const mention = `@${participant.split("@")[0]}`;

          const messageTemplate = setting.message || defaultWelcomeMessage;

          const welcomeText = formatMessage(messageTemplate, mention, groupName);

          await conn.sendMessage(groupId, {

            image: { url: dpUrl },

            caption: welcomeText,

            mentions: [participant]

          });

        }

      }

    }

    

    // Goodbye for departing participants.

    if (update.action === "remove") {

      for (let participant of update.participants) {

        const setting = goodbyeSettings[groupId];

        if (setting && setting.enabled) {

          let dpUrl = "";

          try {

            dpUrl = await conn.profilePictureUrl(participant, "image");

          } catch (error) {

            dpUrl = "https://files.catbox.moe/49gzva.png";

          }

          const mention = `@${participant.split("@")[0]}`;

          const messageTemplate = setting.message || defaultGoodbyeMessage;

          const goodbyeText = formatMessage(messageTemplate, mention, groupName);

          await conn.sendMessage(groupId, {

            image: { url: dpUrl },

            caption: goodbyeText,

            mentions: [participant]

          });

        }

      }

    }

    

    // Handle admin promotions.

    if (update.action === "promote") {

      for (let participant of update.participants) {

        const promoMsg = `ʜᴇʏ @${participant.split("@")[0]}, ʏᴏᴜ'ʀᴇ ɴᴏᴡ ᴀɴ ᴀᴅᴍɪɴ! ʜᴀɴᴅʟᴇ ʏᴏᴜʀ ʀᴇsᴘᴏɴsɪʙɪʟɪᴛʏ ᴡɪᴛʜ ᴄᴀʀᴇ ᴀɴᴅ ʟᴇᴀᴅ ᴛʜᴇ ᴡᴀʏ! 🎉`;

        await conn.sendMessage(groupId, {

          text: promoMsg,

          mentions: [participant]

        });

      }

    }

    // Handle admin demotions.

    if (update.action === "demote") {

      for (let participant of update.participants) {

        const demoMsg = `@${participant.split("@")[0]}, ʏᴏᴜ'ᴠᴇ ʙᴇᴇɴ ᴅᴇᴍᴏᴛᴇᴅ ғʀᴏᴍ ᴀᴅᴍɪɴ. ᴛɪᴍᴇ ᴛᴏ sᴛᴇᴘ ʙᴀᴄᴋ ᴀɴᴅ ʀᴇɢʀᴏᴜᴘ. 😔`;

        await conn.sendMessage(groupId, {

          text: demoMsg,

          mentions: [participant]

        });

      }

    }

  });

}

module.exports = { registerGroupMessages };