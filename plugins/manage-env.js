//---------------------------------------------------------------------------
//           MEGALODON-MD  
//---------------------------------------------------------------------------
//  ⚠️ DO NOT MODIFY THIS FILE ⚠️  
//---------------------------------------------------------------------------
const { cmd, commands } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions2');
const { writeFileSync } = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const axios = require('axios');
const FormData = require('form-data');
const { setConfig, getConfig } = require("../lib/configub");

// SET BOT IMAGE
cmd({
  pattern: "setbotimage",
  alias: ["botdp", "botpic", "botimage"],
  desc: "Set the bot's image URL",
  category: "owner",
  react: "✅",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
  try {
    if (!isCreator) return reply("❗ ᴏɴʟʏ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");

    let imageUrl = args[0];

    // Upload image if replying to one
    if (!imageUrl && m.quoted) {
      const quotedMsg = m.quoted;
      const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';
      if (!mimeType.startsWith("image")) return reply("❌ ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀɴ ɪᴍᴀɢᴇ.");

      const mediaBuffer = await quotedMsg.download();
      const extension = mimeType.includes("jpeg") ? ".jpg" : ".png";
      const tempFilePath = path.join(os.tmpdir(), `botimg_${Date.now()}${extension}`);
      fs.writeFileSync(tempFilePath, mediaBuffer);

      const form = new FormData();
      form.append("fileToUpload", fs.createReadStream(tempFilePath), `botimage${extension}`);
      form.append("reqtype", "fileupload");

      const response = await axios.post("https://catbox.moe/user/api.php", form, {
        headers: form.getHeaders()
      });

      fs.unlinkSync(tempFilePath);

      if (typeof response.data !== 'string' || !response.data.startsWith('https://')) {
        throw new Error(`Catbox upload failed: ${response.data}`);
      }

      imageUrl = response.data;
    }

    if (!imageUrl || !imageUrl.startsWith("http")) {
      return reply("❌ Provide a valid image URL or reply to an image.");
    }

    await setConfig("MENU_IMAGE_URL", imageUrl);

    await reply(`✅ ʙᴏᴛ ɪᴍᴀɢᴇ ᴜᴘᴅᴀᴛᴇᴅ.\n\n*ɴᴇᴡ ᴜʀʟ:* ${imageUrl}\n\n♻️ ʀᴇsᴛᴀʀᴛɪɴɢ...`);
    setTimeout(() => exec("pm2 restart all"), 2000);

  } catch (err) {
    console.error(err);
    reply(`❌ Error: ${err.message || err}`);
  }
});

// SET PREFIX
cmd({
  pattern: "setprefix",
  alias: ["prefix", "prifix"],
  desc: "Set the bot's command prefix",
  category: "owner",
  react: "✅",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
  if (!isCreator) return reply("❗ ᴏɴʟʏ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
  const newPrefix = args[0]?.trim();
  if (!newPrefix || newPrefix.length > 2) return reply("❌ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ᴘʀᴇғɪx (1–2 ᴄʜᴀʀᴀᴄᴛᴇʀs).");

  await setConfig("PREFIX", newPrefix);

  await reply(`✅ ᴘʀᴇғɪx ᴜᴘᴅᴀᴛᴇᴅ ᴛᴏ: *${newPrefix}*\n\n♻️ ʀᴇsᴛᴀʀᴛɪɴɢ...`);
  setTimeout(() => exec("pm2 restart all"), 2000);
});




cmd({
    pattern: "admin-events",
    alias: ["adminevents"],
    desc: "Enable or disable admin event notifications",
    category: "settings",
    filename: __filename
},
async (conn, mek, m, { from, args, isOwner, reply }) => {
    if (!isOwner) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.ADMIN_EVENTS = "true";
        return reply("✅ ᴀᴅᴍɪɴ ᴇᴠᴇɴᴛ ɴᴏᴛɪғɪᴄᴀᴛɪᴏɴs ᴀʀᴇ ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ.");
    } else if (status === "off") {
        config.ADMIN_EVENTS = "false";
        return reply("❌ ᴀᴅᴍɪɴ ᴇᴠᴇɴᴛ ɴᴏᴛɪғɪᴄᴀᴛɪᴏɴs ᴀʀᴇ ɴᴏᴡ ᴅɪ.");
    } else {
        return reply(`Example: .ᴀᴅᴍɪɴ-ᴇᴠᴇɴᴛs ᴏɴ`);
    }
});

cmd({
    pattern: "welcome",
    alias: ["welcomeset"],
    desc: "Enable or disable welcome messages for new members",
    category: "settings",
    filename: __filename
},
async (conn, mek, m, { from, args, isOwner, reply, isCreator, isDev }) => {
    if (!isOwner) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.WELCOME = "true";
        return reply("✅  ᴡᴇʟᴄᴏᴍᴇ ᴍᴇssᴀɢᴇs ᴀʀᴇ ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ.");
    } else if (status === "off") {
        config.WELCOME = "false";
        return reply("❌ ᴡᴇʟᴄᴏᴍᴇ ᴍᴇssᴀɢᴇs ᴀʀᴇ ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ.");
    } else {
        return reply(`Example: .welcome on`);
    }
});



cmd({
    pattern: "mode",
    alias: ["setmode"],
    react: "🫟",
    desc: "Set bot mode to private or public.",
    category: "settings",
    filename: __filename,
}, async (conn, mek, m, { from, args, isOwner, reply }) => {
    if (!isOwner) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    // Si aucun argument n'est fourni, afficher le mode actuel et l'usage
    if (!args[0]) {
        return reply(`📌 Current mode: *${config.MODE}*\n\nᴜsᴀɢᴇ: .ᴍᴏᴅᴇ ᴘʀɪᴠᴀᴛᴇ ᴏʀ .ᴍᴏᴅᴇ ᴘᴜʙʟɪᴄ`);
    }

    const modeArg = args[0].toLowerCase();

    if (modeArg === "private") {
        config.MODE = "private";
        return reply("✅  ʙᴏᴛ ᴍᴏᴅᴇ ɪꜱ ɴᴏᴡ ꜱᴇᴛ ᴛᴏ *ᴩʀɪᴠᴀᴛᴇ*.");
    } else if (modeArg === "public") {
        config.MODE = "public";
        return reply("✅ ʙᴏᴛ ᴍᴏᴅᴇ ɪs ɴᴏᴡ sᴇᴛ ᴛᴏ *ᴘᴜʙʟɪᴄ*.");
    } else {
        return reply("❌ ɪɴᴠᴀʟɪᴅ ᴍᴏᴅᴇ. ᴘʟᴇᴀsᴇ ᴜsᴇ `.ᴍᴏᴅᴇ ᴘʀɪᴠᴀᴛᴇ` ᴏʀ `.ᴍᴏᴅᴇ ᴘᴜʙʟɪᴄ`.");
    }
});

cmd({
    pattern: "auto-typing",
    alias: ["autotyping"],
    description: "Enable or disable auto-typing feature.",
    category: "settings",
    filename: __filename
},    
async (conn, mek, m, { from, args, isOwner, reply }) => {
    if (!isOwner) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) {
        return reply("*🫟 ᴇxᴀᴍᴘʟᴇ:  .ᴀᴜᴛᴏ-ᴛʏᴘɪɴɢ ᴏɴ*");
    }

    config.AUTO_TYPING = status === "on" ? "true" : "false";
    return reply(`ᴀᴜᴛᴏ ᴛʏᴘɪɴɢ ʜᴀs ʙᴇᴇɴ ᴛᴜʀɴᴇᴅ ${status}.`);
});

//mention reply 


cmd({
    pattern: "mention-reply",
    alias: ["menetionreply", "mee"],
    description: "Set bot status to always online or offline.",
    category: "settings",
    filename: __filename
},    
async (conn, mek, m, { from, args, isOwner, reply }) => {
    if (!isOwner) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    // Check the argument for enabling or disabling the anticall feature
    if (args[0] === "on") {
        config.MENTION_REPLY = "true";
        return reply("ᴍᴇɴᴛɪᴏɴ ʀᴇᴘʟʏ ғᴇᴀᴛᴜʀᴇ ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ.");
    } else if (args[0] === "off") {
        config.MENTION_REPLY = "false";
        return reply("ᴍᴇɴᴛɪᴏɴ ʀᴇᴘʟʏ ғᴇᴀᴛᴜʀᴇ ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ.");
    } else {
        return reply(`_example:  .ᴍᴇᴇ ᴏɴ_`);
    }
});


//--------------------------------------------
// ALWAYS_ONLINE COMMANDS
//--------------------------------------------
cmd({
    pattern: "always-online",
    alias: ["alwaysonline"],
    desc: "Enable or disable the always online mode",
    category: "settings",
    filename: __filename
},
async (conn, mek, m, { from, args, isOwner, reply }) => {
    if (!isOwner) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.ALWAYS_ONLINE = "true";
        await reply("*✅ ᴀʟᴡᴀʏs ᴏɴʟɪɴᴇ ᴍᴏᴅᴇ ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ.*");
    } else if (status === "off") {
        config.ALWAYS_ONLINE = "false";
        await reply("*❌ ᴀʟᴡᴀʏs ᴏɴʟɪɴᴇ ᴍᴏᴅᴇ ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ.*");
    } else {
        await reply(`*🛠️ ᴇxᴀᴍᴘʟᴇ: .ᴀʟᴡᴀʏs-ᴏɴʟɪɴᴇ ᴏɴ*`);
    }
});

//--------------------------------------------
//  AUTO_RECORDING COMMANDS
//--------------------------------------------
cmd({
    pattern: "auto-recording",
    alias: ["autorecoding"],
    description: "Enable or disable auto-recording feature.",
    category: "settings",
    filename: __filename
},    
async (conn, mek, m, { from, args, isOwner, reply }) => {
    if (!isOwner) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) {
        return reply("*🫟 ᴇxᴀᴍᴘʟᴇ: .ᴀᴜᴛᴏ-ʀᴇᴄᴏʀᴅɪɴɢ ᴏɴ*");
    }

    config.AUTO_RECORDING = status === "on" ? "true" : "false";
    if (status === "on") {
        await conn.sendPresenceUpdate("recording", from);
        return reply("ᴀᴜᴛᴏ ʀᴇᴄᴏʀᴅɪɴɢ ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ. ʙᴏᴛ ɪs ʀᴇᴄᴏʀᴅɪɴɢ...");
    } else {
        await conn.sendPresenceUpdate("available", from);
        return reply("ᴀᴜᴛᴏ ʀᴇᴄᴏʀᴅɪɴɢ ʜᴀs ʙᴇᴇɴ ᴅɪsᴀʙʟᴇᴅ.");
    }
});
//--------------------------------------------
// AUTO_VIEW_STATUS COMMANDS
//--------------------------------------------
cmd({
    pattern: "auto-seen",
    alias: ["autostatusview"],
    desc: "Enable or disable auto-viewing of statuses",
    category: "settings",
    filename: __filename
},    
async (conn, mek, m, { from, args, isOwner, reply }) => {
    if (!isOwner) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    // Default value for AUTO_VIEW_STATUS is "false"
    if (args[0] === "on") {
        config.AUTO_STATUS_SEEN = "true";
        return reply("ᴀᴜᴛᴏ-ᴠɪᴇᴡɪɴɢ ᴏғ sᴛᴀᴛᴜsᴇs ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ.");
    } else if (args[0] === "off") {
        config.AUTO_STATUS_SEEN = "false";
        return reply("ᴀᴜᴛᴏ-ᴠɪᴇᴡɪɴɢ ᴏғ sᴛᴀᴛᴜsᴇs ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ.");
    } else {
        return reply(`*🫟 ᴇxᴀᴍᴘʟᴇ:  .ᴀᴜᴛᴏ-sᴇᴇɴ ᴏɴ*`);
    }
}); 
//--------------------------------------------
// AUTO_LIKE_STATUS COMMANDS
//--------------------------------------------
cmd({
    pattern: "status-react",
    alias: ["statusreact", "autoreactstatus", "auto-status-react"],
    desc: "Enable or disable auto-liking of statuses",
    category: "settings",
    filename: __filename
},    
async (conn, mek, m, { from, args, isOwner, reply }) => {
    if (!isOwner) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    // Default value for AUTO_LIKE_STATUS is "false"
    if (args[0] === "on") {
        config.AUTO_STATUS_REACT = "true";
        return reply("ᴀᴜᴛᴏ-ʟɪᴋɪɴɢ ᴏғ sᴛᴀᴛᴜsᴇs is ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ.");
    } else if (args[0] === "off") {
        config.AUTO_STATUS_REACT = "false";
        return reply("ᴀᴜᴛᴏ-ʟɪᴋɪɴɢ ᴏғ sᴛᴀᴛᴜsᴇs ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ.");
    } else {
        return reply(`Example: . sᴛᴀᴛᴜs-ʀᴇᴀᴄᴛ ᴏɴ`);
    }
});

//--------------------------------------------
//  READ-MESSAGE COMMANDS
//--------------------------------------------
cmd({
    pattern: "read-message",
    alias: ["autoread"],
    desc: "enable or disable readmessage.",
    category: "settings",
    filename: __filename
},    
async (conn, mek, m, { from, args, isOwner, reply }) => {
    if (!isOwner) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    // Check the argument for enabling or disabling the anticall feature
    if (args[0] === "on") {
        config.READ_MESSAGE = "true";
        return reply("ʀᴇᴀᴅᴍᴇssᴀɢᴇ ғᴇᴀᴛᴜʀᴇ ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ.");
    } else if (args[0] === "off") {
        config.READ_MESSAGE = "false";
        return reply("ʀᴇᴀᴅᴍᴇssᴀɢᴇ ғᴇᴀᴛᴜʀᴇ ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ.");
    } else {
        return reply(`_ᴇxᴀᴍᴘʟᴇ:  .ʀᴇᴀᴅᴍᴇssᴀɢᴇ ᴏɴ_`);
    }
});



//--------------------------------------------
//  ANI-BAD COMMANDS
//--------------------------------------------
cmd({
    pattern: "anti-bad",
    alias: ["antibadword"],
    desc: "enable or disable antibad.",
    category: "settings",
    filename: __filename
},    
async (conn, mek, m, { from, args, isOwner, reply }) => {
    if (!isOwner) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    // Check the argument for enabling or disabling the anticall feature
    if (args[0] === "on") {
        config.ANTI_BAD_WORD = "true";
        return reply("*anti bad word is now enabled.*");
    } else if (args[0] === "off") {
        config.ANTI_BAD_WORD = "false";
        return reply("*ᴀɴᴛɪ ʙᴀᴅ ᴡᴏʀᴅ ғᴇᴀᴛᴜʀᴇ ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ*");
    } else {
        return reply(`_ᴇxᴀᴍᴘʟᴇ:  .ᴀɴᴛɪʙᴀᴅ ᴏɴ_`);
    }
});

//--------------------------------------------
//   AUTO-REACT COMMANDS
//--------------------------------------------
cmd({
    pattern: "auto-react",
    alias: ["autoreact"],
    desc: "Enable or disable the autoreact feature",
    category: "settings",
    filename: __filename
},    
async (conn, mek, m, { from, args, isOwner, reply }) => {
    if (!isOwner) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    // Check the argument for enabling or disabling the anticall feature
    if (args[0] === "on") {
        config.AUTO_REACT = "true";
        await reply("*ᴀᴜᴛᴏʀᴇᴀᴄᴛ ғᴇᴀᴛᴜʀᴇ ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ.*");
    } else if (args[0] === "off") {
        config.AUTO_REACT = "false";
        await reply("ᴀᴜᴛᴏʀᴇᴀᴄᴛ ғᴇᴀᴛᴜʀᴇ ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ.");
    } else {
        await reply(`*🫟 ᴇxᴀᴍᴘʟᴇ: .ᴀᴜᴛᴏ-ʀᴇᴀᴄᴛ ᴏɴ*`);
    }
});
//--------------------------------------------
//  STATUS-REPLY COMMANDS
//--------------------------------------------
cmd({
    pattern: "status-reply",
    alias: ["autostatusreply"],
    desc: "enable or disable status-reply.",
    category: "settings",
    filename: __filename
},    
async (conn, mek, m, { from, args, isOwner, reply }) => {
    if (!isOwner) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    // Check the argument for enabling or disabling the anticall feature
    if (args[0] === "on") {
        config.AUTO_STATUS_REPLY = "true";
        return reply("sᴛᴀᴛᴜs-ʀᴇᴘʟʏ ғᴇᴀᴛᴜʀᴇ ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ.");
    } else if (args[0] === "off") {
        config.AUTO_STATUS_REPLY = "false";
        return reply("sᴛᴀᴛᴜs-ʀᴇᴘʟʏ ғᴇᴀᴛᴜʀᴇ ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ.");
    } else {
        return reply(`*🫟 ᴇxᴀᴍᴘʟᴇ:  .sᴛᴀᴛᴜs-ʀᴇᴘʟʏ ᴏɴ*`);
    }
});

//--------------------------------------------
//  ANTILINK COMMANDS
//--------------------------------------------

cmd({
  pattern: "antilink",
  alias: ["antilinks"],
  desc: "Enable or disable ANTI_LINK in groups",
  category: "group",
  react: "🚫",
  filename: __filename
}, async (conn, mek, m, { isGroup, isAdmins, isBotAdmins, args, reply }) => {
  try {
    if (!isGroup) return reply('ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ can ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ᴀ ɢʀᴏᴜᴘ.');
    if (!isBotAdmins) return reply('ʙᴏᴛ ᴍᴜsᴛ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ to use ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.');
    if (!isAdmins) return reply('ʏᴏᴜ ᴍᴜsᴛ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.');

    if (args[0] === "on") {
      config.ANTI_LINK = "true";
      reply("✅ ᴀɴᴛɪ_ʟɪɴᴋ ʜᴀs ʙᴇᴇɴ ᴇɴᴀʙʟᴇᴅ.");
    } else if (args[0] === "off") {
      config.ANTI_LINK = "false";
      reply("❌ ᴀɴᴛɪ_ʟɪɴᴋ ʜᴀs ʙᴇᴇɴ ᴅɪsᴀʙʟᴇᴅ.");
    } else {
      reply("Usage: *.ᴀɴᴛɪʟɪɴᴋ ᴏɴ/ᴏғғ*");
    }
  } catch (e) {
    reply(`Error: ${e.message}`);
  }
});

cmd({
  pattern: "antilinkkick",
  alias: ["kicklink"],
  desc: "Enable or disable ANTI_LINK_KICK in groups",
  category: "group",
  react: "⚠️",
  filename: __filename
}, async (conn, mek, m, { isGroup, isAdmins, isBotAdmins, args, reply }) => {
  try {
    if (!isGroup) return reply('This ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ᴀ ɢʀᴏᴜᴘ.');
    if (!isBotAdmins) return reply('Bot ᴍᴜsᴛ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.');
    if (!isAdmins) return reply('You ᴍᴜsᴛ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.');

    if (args[0] === "on") {
      config.ANTI_LINK_KICK = "true";
      reply("✅ ANTI_LINK_KICK has been enabled.");
    } else if (args[0] === "off") {
      config.ANTI_LINK_KICK = "false";
      reply("❌ ᴀɴᴛɪ_ʟɪɴᴋ_ᴋɪᴄᴋ ʜᴀs ʙᴇᴇɴ ᴅɪsᴀʙʟᴇᴅ.");
    } else {
      reply("Usage: *.ᴀɴᴛɪʟɪɴᴋᴋɪᴄᴋ ᴏɴ/ᴏғғ*");
    }
  } catch (e) {
    reply(`Error: ${e.message}`);
  }
});


cmd({
  pattern: "deletelink",
  alias: ["linksdelete"],
  desc: "Enable or disable DELETE_LINKS in groups",
  category: "group",
  react: "❌",
  filename: __filename
}, async (conn, mek, m, { isGroup, isAdmins, isBotAdmins, args, reply }) => {
  try {
    if (!isGroup) return reply('This ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ a ɢʀᴏᴜᴘ.');
    if (!isBotAdmins) return reply('Bot ᴍᴜsᴛ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.');
    if (!isAdmins) return reply('You ᴍᴜsᴛ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.');

    if (args[0] === "on") {
      config.DELETE_LINKS = "true";
      reply("✅ ᴅᴇʟᴇᴛᴇ_ʟɪɴᴋs ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ.");
    } else if (args[0] === "off") {
      config.DELETE_LINKS = "false";
      reply("❌ ᴅᴇʟᴇᴛᴇ_ʟɪɴᴋs ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ.");
    } else {
      reply("Usage: *.ᴅᴇʟᴇᴛᴇʟɪɴᴋ ᴏɴ/ᴏғғ*");
    }
  } catch (e) {
    reply(`Error: ${e.message}`);
  }
});
