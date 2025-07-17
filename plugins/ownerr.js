const fs = require("fs");
const { cmd, commands } = require('../command');
const config = require('../config');
const axios = require('axios');
const prefix = config.PREFIX;
const AdmZip = require("adm-zip");
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions2');
const { writeFileSync } = require('fs');
const path = require('path');




const OWNER_PATH = path.join(__dirname, "../lib/owner.json");

// مطمئن شو فایل owner.json هست
const ensureOwnerFile = () => {
  if (!fs.existsSync(OWNER_PATH)) {
    fs.writeFileSync(OWNER_PATH, JSON.stringify([]));
  }
};

// افزودن شماره به owner.json
cmd({
    pattern: "setsudo",
    alias: ["addsudo"],
    desc: "Add a temporary owner",
    category: "owner",
    react: "👑",
    filename: __filename
}, async (conn, mek, m, { from, args, q, isCreator, reply, isOwner }) => {
    try {
        if (!isCreator) return reply("📛 *ᴄᴏᴍᴍᴀɴᴅ ʀᴇsᴇʀᴠᴇᴅ ғᴏʀ ᴏᴡɴᴇʀ ᴀɴᴅ ᴏɴʟʏ!*");

        // Target
        let target = m.mentionedJid?.[0] 
            || (m.quoted?.sender ?? null)
            || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net");

        if (!target) return reply("*ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ɴᴜᴍʙᴇʀ ᴏʀ ᴛᴀɢ/ʀᴇᴘʟʏ ᴀ ᴜsᴇʀ.*");

        let own = JSON.parse(fs.readFileSync("./lib/owner.json", "utf-8"));

        if (own.includes(target)) {
            return reply("ᴛʜɪs ᴜsᴇʀ ɪs ᴀʟʀᴇᴀᴅʏ ᴀ ᴛᴇᴍᴘᴏʀᴀʀʏ ᴏᴡɴᴇʀ.");
        }

        own.push(target);
        const uniqueOwners = [...new Set(own)];
        fs.writeFileSync("./lib/owner.json", JSON.stringify(uniqueOwners, null, 2));

        const dec = `✅ @${target.split("@")[0]} ʜᴀs ʙᴇᴇɴ ᴀᴅᴅᴇᴅ ᴀs ᴀ ᴛᴇᴍᴘᴏʀᴀʀʏ ᴏᴡɴᴇʀ`;

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/roubzi.jpg" },
            caption: dec,
            mentions: [target] // 🔥 Ceci active le tag du user
        }, { quoted: mek });

    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});

// حذف شماره از owner.json
cmd({
    pattern: "delsudo",
    alias: ["sudodel"],
    desc: "Remove a temporary owner",
    category: "owner",
    react: "🫩",
    filename: __filename
}, async (conn, mek, m, { from, args, q, isCreator, reply, isOwner }) => {
    try {
        if (!isCreator) return reply("📛 *ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴍʏ ᴏᴡɴᴇʀ !*");

        let target = m.mentionedJid?.[0] 
            || (m.quoted?.sender ?? null)
            || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net");

        // اگر هیچ هدفی وارد نشده بود، پیام خطا بده
        if (!target) return reply("ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ɴᴜᴍʙᴇʀ ᴏʀ ᴛᴀɢ/ʀᴇᴘʟʏ ᴀ ᴜsᴇʀ.");

        let own = JSON.parse(fs.readFileSync("./lib/owner.json", "utf-8"));

        if (!own.includes(target)) {
            return reply("❌ ᴜsᴇʀ ɴᴏᴛ ғᴏᴜɴᴅ ɪɴ ᴏᴡɴᴇʀ ʟɪsᴛ.");
        }

        const updated = own.filter(x => x !== target);
        fs.writeFileSync("./lib/owner.json", JSON.stringify(updated, null, 2));

        const dec = "✅ sᴜᴄᴄᴇssғᴜʟʟʏ ʀᴇᴍᴏᴠᴇᴅ User ᴀs ᴛᴇᴍᴘᴏʀᴀʀʏ ᴏᴡɴᴇʀ";
        await conn.sendMessage(from, {  // استفاده از await در اینجا درست است
            image: { url: "https://files.catbox.moe/roubzi.jpg" },
            caption: dec
        }, { quoted: mek });
    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});

cmd({
    pattern: "getsudo",
    alias: ["listsudo"],
    desc: "List all temporary owners",
    category: "owner",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply, isOwner }) => {
    try {
    if (!isCreator) return reply("📛 *ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴍʏ ᴏᴡɴᴇʀ !*");
        // Check if the user is the owner
        if (!isOwner) {
            return reply("❌ ʏᴏᴜ ᴀʀᴇ ɴᴏᴛ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ.");
        }

        // Read the owner list from the file and remove duplicates
        let own = JSON.parse(fs.readFileSync("./lib/owner.json", "utf-8"));
        own = [...new Set(own)]; // Remove duplicates

        // If no temporary owners exist
        if (own.length === 0) {
            return reply("❌ ɴᴏ ᴛᴇᴍᴘᴏʀᴀʀʏ ᴏᴡɴᴇʀs ғᴏᴜɴᴅ.");
        }

        // Create the message with owner list
        let listMessage = "*ʟɪsᴛ ᴏғ ᴛᴇᴍᴘᴏʀᴀʀʏ ᴏᴡɴᴇʀs:*\n\n";
        own.forEach((owner, index) => {
            listMessage += `${index + 1}. ${owner.replace("@s.whatsapp.net", "")}\n`;
        });

        // Send the message with an image and formatted caption
        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/roubzi.jpg" },
            caption: listMessage
        }, { quoted: mek });
    } catch (err) {
        // Handle errors
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});

cmd({
    pattern: "block",
    desc: "Blocks a person",
    category: "owner",
    react: "🚫",
    filename: __filename
},
async (conn, m, { reply, q, react }) => {
    // Get the bot owner's number dynamically
    const botOwner = conn.user.id.split(":")[0] + "@s.whatsapp.net";
    
    if (m.sender !== botOwner) {
        await react("❌");
        return reply("ᴏɴʟʏ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
    }

    let jid;
    if (m.quoted) {
        jid = m.quoted.sender; // If replying to a message, get sender JID
    } else if (m.mentionedJid.length > 0) {
        jid = m.mentionedJid[0]; // If mentioning a user, get their JID
    } else if (q && q.includes("@")) {
        jid = q.replace(/[@\s]/g, '') + "@s.whatsapp.net"; // If manually typing a JID
    } else {
        await react("❌");
        return reply("ᴘʟᴇᴀsᴇ ᴍᴇɴᴛɪᴏɴ ᴀ ᴜsᴇʀ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴛʜᴇɪʀ ᴍᴇssᴀɢᴇ.");
    }

    try {
        await conn.updateBlockStatus(jid, "block");
        await react("✅");
        reply(`sᴜᴄᴄᴇssғᴜʟʟʏ ʙʟᴏᴄᴋᴇᴅ @${jid.split("@")[0]}`, { mentions: [jid] });
    } catch (error) {
        console.error("Block command error:", error);
        await react("❌");
        reply("Failed to block the user.");
    }
});

cmd({
    pattern: "unblock",
    desc: "Unblocks a person",
    category: "owner",
    react: "🔓",
    filename: __filename
},
async (conn, m, { reply, q, react }) => {
    // Get the bot owner's number dynamically
    const botOwner = conn.user.id.split(":")[0] + "@s.whatsapp.net";

    if (m.sender !== botOwner) {
        await react("❌");
        return reply("ᴏɴʟʏ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
    }

    let jid;
    if (m.quoted) {
        jid = m.quoted.sender;
    } else if (m.mentionedJid.length > 0) {
        jid = m.mentionedJid[0];
    } else if (q && q.includes("@")) {
        jid = q.replace(/[@\s]/g, '') + "@s.whatsapp.net";
    } else {
        await react("❌");
        return reply("ᴘʟᴇᴀsᴇ ᴍᴇɴᴛɪᴏɴ ᴀ ᴜsᴇʀ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴛʜᴇɪʀ ᴍᴇssᴀɢᴇ.");
    }

    try {
        await conn.updateBlockStatus(jid, "unblock");
        await react("✅");
        reply(`sᴜᴄᴄᴇssғᴜʟʟʏ ᴜɴʙʟᴏᴄᴋᴇᴅ @${jid.split("@")[0]}`, { mentions: [jid] });
    } catch (error) {
        console.error("Unblock command error:", error);
        await react("❌");
        reply("Failed to unblock the user.");
    }
});           

cmd({
    pattern: "mode",
    alias: ["setmode"],
    react: "🫟",
    desc: "Set bot mode to private or public.",
    category: "owner",
    filename: __filename,
}, async (conn, mek, m, { from, args, isCreator, reply, isOwner }) => {
    if (!isOwner && !isCreator) return reply("_*❗ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴍʏ ᴏᴡɴᴇʀ !*_");

    if (!args[0]) {
        const text = `> *𝐌𝐎𝐃𝐄 𝐒𝐄𝐓𝐓𝐈𝐍𝐆𝐒*\n\n> ᴄᴜʀʀᴇɴᴛ ᴍᴏᴅᴇ: *ᴘᴜʙʟɪᴄ*\n\nʀᴇᴘʟʏ ᴡɪᴛʜ:\n\n*1.* ᴛᴏ ᴇɴᴀʙʟᴇ ᴘᴜʙʟɪᴄ ᴍᴏᴅᴇ\n*2.* ᴛᴏ ᴇɴᴀʙʟᴇ ᴘʀɪᴠᴀᴛᴇ ᴍᴏᴅᴇ\n*3.* ᴛᴏ ᴇɴᴀʙʟᴇ ɪɴʙᴏx ᴍᴏᴅᴇ\n*4.* ᴛᴏ ᴇɴᴀʙʟᴇ ɢʀᴏᴜᴘs ᴍᴏᴅᴇ\n\n╭────────────────\n│ *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*\n╰─────────────────◆`;

        const sentMsg = await conn.sendMessage(from, {
            image: { url: config.MENU_IMAGE_URL },  // تصویر منوی مد
            caption: text
        }, { quoted: mek });

        const messageID = sentMsg.key.id;

        const handler = async (msgData) => {
            try {
                const receivedMsg = msgData.messages[0];
                if (!receivedMsg?.message || !receivedMsg.key?.remoteJid) return;

                const quoted = receivedMsg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const quotedId = receivedMsg.message?.extendedTextMessage?.contextInfo?.stanzaId;

                const isReply = quotedId === messageID;
                if (!isReply) return;

                const replyText =
                    receivedMsg.message?.conversation ||
                    receivedMsg.message?.extendedTextMessage?.text ||
                    "";

                const sender = receivedMsg.key.remoteJid;

                let newMode = "";
                if (replyText === "1") newMode = "public";
                else if (replyText === "2") newMode = "private";
                else if (replyText === "3") newMode = "inbox";
                else if (replyText === "4") newMode = "groups";

                if (newMode) {
                    config.MODE = newMode;
                    await conn.sendMessage(sender, {
                        text: `✅ ʙᴏᴛ ᴍᴏᴅᴇ ɪs ɴᴏᴡ sᴇᴛ ᴛᴏ *${newMode.toUpperCase()}*.`
                    }, { quoted: receivedMsg });
                } else {
                    await conn.sendMessage(sender, {
                        text: "❌ ɪɴᴠᴀʟɪᴅ ᴏᴘᴛɪᴏɴ. ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴡɪᴛʜ *1*, *2*, *3* or *4*."
                    }, { quoted: receivedMsg });
                }

                conn.ev.off("messages.upsert", handler);
            } catch (e) {
                console.log("Mode handler error:", e);
            }
        };

        conn.ev.on("messages.upsert", handler);

        setTimeout(() => {
            conn.ev.off("messages.upsert", handler);
        }, 600000);

        return;
    }

    const modeArg = args[0].toLowerCase();

    if (["public", "private", "inbox", "groups"].includes(modeArg)) {
      config.MODE = modeArg;
      return reply(`✅ ʙᴏᴛ ᴍᴏᴅᴇ ɪs ɴᴏᴡ sᴇᴛ ᴛᴏ *${modeArg.toUpperCase()}*.`);
    } else {
      return reply("❌ ɪɴᴠᴀʟɪᴅ ᴍᴏᴅᴇ. ᴘʟᴇᴀsᴇ ᴜsᴇ `.ᴍᴏᴅᴇ ᴘᴜʙʟɪᴄ`, `.ᴍᴏᴅᴇ ᴘʀɪᴠᴀᴛᴇ`, `.ᴍᴏᴅᴇ ɪɴʙᴏx`, ᴏʀ `.ᴍᴏᴅᴇ ɢʀᴏᴜᴘs`.");
    }
});

cmd({
    pattern: "auto-typing",
    alias: ["typing", "autotyping"],
    description: "Enable or disable auto-typing feature.",
    category: "owner",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply, isOwner }) => {
    if (!isOwner && !isCreator) return reply("_*❗ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴍʏ ᴏᴡɴᴇʀ !*_");

    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) {
        return reply("*🫟 ᴇxᴀᴍᴘʟᴇ:  .ᴀᴜᴛᴏ-ᴛʏᴘɪɴɢ ᴏɴ*");
    }

    config.AUTO_TYPING = status === "on" ? "true" : "false";
    return reply(`ᴀᴜᴛᴏ ᴛʏᴘɪɴɢ ʜᴀs ʙᴇᴇɴ ᴛᴜʀɴᴇᴅ ${status}.`);
});

//--------------------------------------------
// ALWAYS_ONLINE COMMANDS
//--------------------------------------------
cmd({
    pattern: "always-online",
    alias: ["alwaysonline"],
    desc: "Enable or disable the always online mode",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, args, isCreator, reply, isOwner }) => {
    if (!isOwner && !isCreator) return reply("_*❗ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴍʏ ᴏᴡɴᴇʀ !*_");

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.ALWAYS_ONLINE = "true";
        await reply("*✅ ᴀʟᴡᴀʏs ᴏɴʟɪɴᴇ ᴍᴏᴅᴇ ɪs now ᴇɴᴀʙʟᴇᴅ.*");
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
    alias: ["autorecoding", "recording"],
    description: "Enable or disable auto-recording feature.",
    category: "owner",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply, isOwner }) => {
    if (!isOwner && !isCreator) return reply("_*❗ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴍʏ ᴏᴡɴᴇʀ !*_");

    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) {
        return reply("*🫟 ᴇxᴀᴍᴘʟᴇ: .ᴀᴜᴛᴏ-ʀᴇᴄᴏʀᴅɪɴɢ ᴏɴ*");
    }

    config.AUTO_RECORDING = status === "on" ? "true" : "false";
    if (status === "on") {
        await conn.sendPresenceUpdate("recording", from);
        return reply("ᴀᴜᴛᴏo ʀᴇᴄᴏʀᴅɪɴɢ ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ. ʙᴏᴛ ɪs ʀᴇᴄᴏʀᴅɪɴɢ...");
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
    alias: ["autostatusview", "autoviewstatus"],
    desc: "Enable or disable auto-viewing of statuses",
    category: "owner",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply, isOwner }) => {
    if (!isOwner && !isCreator) return reply("_*❗ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴍʏ ᴏᴡɴᴇʀ !*_");

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
    alias: ["statusreaction", "statusreact", "reactstatus", "react-status"],
    desc: "Enable or disable auto-liking of statuses",
    category: "owner",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply, isOwner }) => {
    if (!isOwner && !isCreator) return reply("_*❗ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴍʏ ᴏᴡɴᴇʀ !*_");

    const status = args[0]?.toLowerCase();
    // Default value for AUTO_LIKE_STATUS is "false"
    if (args[0] === "on") {
        config.AUTO_STATUS_REACT = "true";
        return reply("ᴀᴜᴛᴏ-ʟɪᴋɪɴɢ ᴏғ sᴛᴀᴛᴜsᴇs ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ.");
    } else if (args[0] === "off") {
        config.AUTO_STATUS_REACT = "false";
        return reply("ᴀᴜᴛᴏ-ʟɪᴋɪɴɢ ᴏғ sᴛᴀᴛᴜsᴇs ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ.");
    } else {
        return reply(`ᴇxᴀᴍᴘʟᴇ: . sᴛᴀᴛᴜs-ʀᴇᴀᴄᴛ ᴏɴ`);
    }
});

//--------------------------------------------
//  READ-MESSAGE COMMANDS
//--------------------------------------------
cmd({
    pattern: "read-message",
    alias: ["autoread"],
    desc: "enable or disable readmessage.",
    category: "owner",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply, isOwner }) => {
    if (!isOwner && !isCreator) return reply("_*❗ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴍʏ ᴏᴡɴᴇʀ !*_");

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
//   AUTO-REACT COMMANDS
//--------------------------------------------
cmd({
    pattern: "auto-react",
    alias: ["autoreact"],
    desc: "Enable or disable the autoreact feature",
    category: "owner",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply, isOwner }) => {
    if (!isOwner && !isCreator) return reply("_*❗ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴍʏ ᴏᴡɴᴇʀ !*_");

    const status = args[0]?.toLowerCase();
    // Check the argument for enabling or disabling the anticall feature
    if (args[0] === "on") {
        config.AUTO_REACT = "true";
        await reply("*ᴀᴜᴛᴏʀᴇᴀᴄᴛ ғᴇᴀᴛᴜʀᴇ ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ ✔.*");
    } else if (args[0] === "off") {
        config.AUTO_REACT = "false";
        await reply("ᴀᴜᴛᴏʀᴇᴀᴄᴛ ғᴇᴀᴛᴜʀᴇ ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ.");
    } else {
        await reply(`*🫟 ᴇxᴀᴍᴘʟᴇ: .ᴀᴜᴛᴏ-ʀᴇᴀᴄᴛ ᴏɴ*`);
    }
});
//--------------------------------
//  STATUS-REPLY COMMANDS
//--------------------------------------------
cmd({
    pattern: "status-reply",
    alias: ["autostatusreply"],
    desc: "enable or disable status-reply.",
    category: "owner",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply, isOwner }) => {
    if (!isOwner && !isCreator) return reply("_*❗ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴍʏ ᴏᴡɴᴇʀ !*_");

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
//  ANTI-LINK COMMANDS
//--------------------------------------------
cmd({
  pattern: "antilink",
  desc: "Configure ANTILINK system with menu",
  category: "owner",
  react: "🛡️",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isCreator, reply, isOwner }) => {
  try {
    if (!isOwner && !isCreator) return reply("_*❗ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴍʏ ᴏᴡɴᴇʀ !*_");

    const currentMode =
      config.ANTILINK_KICK === "true"
        ? "Remove"
        : config.ANTILINK_WARN === "true"
        ? "Warn"
        : config.ANTILINK === "true"
        ? "Delete"
        : "Disabled";

    const text = `> *𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊 𝐒𝐄𝐓𝐓𝐈𝐍𝐆𝐒*\n\n> ᴄᴜʀʀᴇɴᴛ ᴍᴏᴅᴇ: *${currentMode}*\n\nʀᴇᴘʟʏ ᴡɪᴛʜ:\n\n*1.* ᴇɴᴀʙʟᴇ ᴀɴᴛɪʟɪɴᴋ => ᴡᴀʀɴ\n*2.* ᴇɴᴀʙʟᴇ ᴀɴᴛɪʟɪɴᴋ => ᴅᴇʟᴇᴛᴇ\n*3.* ᴇɴᴀʙʟᴇ ᴀɴᴛɪʟɪɴᴋ => ʀᴇᴍᴏᴠᴇ/ᴋɪᴄᴋ\n*4.* ᴅɪsᴀʙʟᴇ ᴀʟʟ ᴀɴᴛɪʟɪɴᴋ ᴍᴏᴅᴇs\n\n╭────────────────\n│ *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*\n╰─────────────────◆`;

    const sentMsg = await conn.sendMessage(from, {
      image: { url: config.MENU_IMAGE_URL },
      caption: text
    }, { quoted: mek });

    const messageID = sentMsg.key.id;

    const handler = async (msgData) => {
      try {
        const receivedMsg = msgData.messages[0];
        if (!receivedMsg?.message || !receivedMsg.key?.remoteJid) return;

        const quotedId = receivedMsg.message?.extendedTextMessage?.contextInfo?.stanzaId;
        const isReply = quotedId === messageID;
        if (!isReply) return;

        const replyText =
          receivedMsg.message?.conversation ||
          receivedMsg.message?.extendedTextMessage?.text ||
          "";

        const sender = receivedMsg.key.remoteJid;

        // Reset all modes
        config.ANTILINK = "false";
        config.ANTILINK_WARN = "false";
        config.ANTILINK_KICK = "false";

        if (replyText === "1") {
          config.ANTILINK_WARN = "true";
          await conn.sendMessage(sender, { text: "✅ ᴀɴᴛɪʟɪɴᴋ 'ᴡᴀʀɴ' ᴍᴏᴅᴇ ᴇɴᴀʙʟᴇᴅ." }, { quoted: receivedMsg });
        } else if (replyText === "2") {
          config.ANTILINK = "true";
          await conn.sendMessage(sender, { text: "✅ ᴀɴᴛɪʟɪɴᴋ 'ᴅᴇʟᴇᴛᴇ' ᴍᴏᴅᴇ ᴇɴᴀʙʟᴇᴅ." }, { quoted: receivedMsg });
        } else if (replyText === "3") {
          config.ANTILINK_KICK = "true";
          await conn.sendMessage(sender, { text: "✅ ᴀɴᴛɪʟɪɴᴋ 'ʀᴇᴍᴏᴠᴇ/ᴋɪᴄᴋ' ᴍᴏᴅᴇ ᴇɴᴀʙʟᴇᴅ." }, { quoted: receivedMsg });
        } else if (replyText === "4") {
          await conn.sendMessage(sender, { text: "❌ ᴀʟʟ ᴀɴᴛɪʟɪɴᴋ ғᴇᴀᴛᴜʀᴇs ʜᴀᴠᴇ ʙᴇᴇɴ ᴅɪsᴀʙʟᴇᴅ." }, { quoted: receivedMsg });
        } else {
          await conn.sendMessage(sender, { text: "❌ ɪɴᴠᴀʟɪᴅ ᴏᴘᴛɪᴏɴ. ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴡɪᴛʜ 1, 2, 3, ᴏʀ 4." }, { quoted: receivedMsg });
        }

        conn.ev.off("messages.upsert", handler);
      } catch (err) {
        console.log("Antilink handler error:", err);
      }
    };

    conn.ev.on("messages.upsert", handler);

    setTimeout(() => {
      conn.ev.off("messages.upsert", handler);
    }, 600000);
  } catch (e) {
    reply(`❗ Error: ${e.message}`);
  }
});
//
cmd({
  on: 'body'
}, async (conn, m, store, {
  from,
  body,
  sender,
  isGroup,
  isAdmins,
  isBotAdmins
}) => {
  try {
    if (!isGroup || isAdmins || !isBotAdmins) {
      return;
    }
    const linkPatterns = [
      /https?:\/\/(?:chat\.whatsapp\.com|wa\.me)\/\S+/gi,
      /^https?:\/\/(www\.)?whatsapp\.com\/channel\/([a-zA-Z0-9_-]+)$/,
      /wa\.me\/\S+/gi,
      /https?:\/\/(?:t\.me|telegram\.me)\/\S+/gi,
      /https?:\/\/(?:www\.)?youtube\.com\/\S+/gi,
      /https?:\/\/youtu\.be\/\S+/gi,
      /https?:\/\/(?:www\.)?facebook\.com\/\S+/gi,
      /https?:\/\/fb\.me\/\S+/gi,
      /https?:\/\/(?:www\.)?instagram\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?twitter\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?tiktok\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?linkedin\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?snapchat\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?pinterest\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?reddit\.com\/\S+/gi,
      /https?:\/\/ngl\/\S+/gi,
      /https?:\/\/(?:www\.)?discord\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?twitch\.tv\/\S+/gi,
      /https?:\/\/(?:www\.)?vimeo\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?dailymotion\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?medium\.com\/\S+/gi
    ];
    const containsLink = linkPatterns.some(pattern => pattern.test(body));

    if (containsLink && config.ANTILINK === 'true') {
      await conn.sendMessage(from, { delete: m.key }, { quoted: m });
      await conn.sendMessage(from, {
        'text': `@${sender.split('@')[0]}. ⚠️ ʟɪɴᴋs ᴀʀᴇ ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ ɪɴ ᴛʜɪs ɢʀᴏᴜᴘ`,
        'mentions': [sender]
      }, { 'quoted': m });
    }
  } catch (error) {
    console.error(error);
  }
});
//
cmd({
  'on': "body"
}, async (conn, m, store, {
  from,
  body,
  sender,
  isGroup,
  isAdmins,
  isBotAdmins,
  reply
}) => {
  try {
    // Initialize warnings if not exists
    if (!global.warnings) {
      global.warnings = {};
    }

    // Only act in groups where bot is admin and sender isn't admin
    if (!isGroup || isAdmins || !isBotAdmins) {
      return;
    }

    // List of link patterns to detect
    const linkPatterns = [
      /https?:\/\/(?:chat\.whatsapp\.com|wa\.me)\/\S+/gi, // WhatsApp links
      /https?:\/\/(?:api\.whatsapp\.com|wa\.me)\/\S+/gi,  // WhatsApp API links
      /wa\.me\/\S+/gi,                                    // WhatsApp.me links
      /https?:\/\/(?:t\.me|telegram\.me)\/\S+/gi,         // Telegram links
      /https?:\/\/(?:www\.)?\.com\/\S+/gi,                // Generic .com links
      /https?:\/\/(?:www\.)?twitter\.com\/\S+/gi,         // Twitter links
      /https?:\/\/(?:www\.)?linkedin\.com\/\S+/gi,        // LinkedIn links
      /https?:\/\/(?:whatsapp\.com|channel\.me)\/\S+/gi,  // Other WhatsApp/channel links
      /https?:\/\/(?:www\.)?reddit\.com\/\S+/gi,          // Reddit links
      /https?:\/\/(?:www\.)?discord\.com\/\S+/gi,         // Discord links
      /https?:\/\/(?:www\.)?twitch\.tv\/\S+/gi,           // Twitch links
      /https?:\/\/(?:www\.)?vimeo\.com\/\S+/gi,           // Vimeo links
      /https?:\/\/(?:www\.)?dailymotion\.com\/\S+/gi,     // Dailymotion links
      /https?:\/\/(?:www\.)?medium\.com\/\S+/gi           // Medium links
    ];

    // Check if message contains any forbidden links
    const containsLink = linkPatterns.some(pattern => pattern.test(body));

    // Only proceed if anti-link is enabled and link is detected
    if (containsLink && config.ANTILINK_WARN === 'true') {
      console.log(`Link detected from ${sender}: ${body}`);

      // Try to delete the message
      try {
        await conn.sendMessage(from, {
          delete: m.key
        });
        console.log(`Message deleted: ${m.key.id}`);
      } catch (error) {
        console.error("Failed to delete message:", error);
      }

      // Update warning count for user
      global.warnings[sender] = (global.warnings[sender] || 0) + 1;
      const warningCount = global.warnings[sender];

      // Handle warnings
      if (warningCount < 4) {
        // Send warning message
        await conn.sendMessage(from, {
          text: `‎*⚠️𝐋𝐈𝐍𝐊𝐒 𝐀𝐑𝐄 𝐍𝐎𝐓 𝐀𝐋𝐋𝐎𝐖𝐄𝐃⚠️*\n` +
                `*╭────⬡ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 ⬡────*\n` +
                `*├▢ ᴜsᴇʀ :* @${sender.split('@')[0]}!\n` +
                `*├▢ ᴄᴏᴜɴᴛ : ${warningCount}*\n` +
                `*├▢ ʀᴇᴀsᴏɴ : 𝐋𝐈𝐍𝐊 𝐒𝐄𝐍𝐃𝐈𝐍𝐆*\n` +
                `*├▢ ᴡᴀʀɴ ʟɪᴍɪᴛ : 4*\n` +
                `*╰────────────────*`,
          mentions: [sender]
        });
      } else {
        // Remove user if they exceed warning limit
        await conn.sendMessage(from, {
          text: `@${sender.split('@')[0]} *ʜᴀs ʙᴇᴇɴ ʀᴇᴍᴏᴠᴇᴅ - ᴡᴀʀɴ ʟɪᴍɪᴛ ᴇxᴄᴇᴇᴅᴇᴅ!*`,
          mentions: [sender]
        });
        await conn.groupParticipantsUpdate(from, [sender], "remove");
        delete global.warnings[sender];
      }
    }
  } catch (error) {
    console.error("Anti-link error:", error);
    reply("❌ An error occurred while processing the message.");
  }
});
//
cmd({
  'on': "body"
}, async (conn, m, store, {
  from,
  body,
  sender,
  isGroup,
  isAdmins,
  isBotAdmins,
  reply
}) => {
  try {
    if (!isGroup || isAdmins || !isBotAdmins) {
      return;
    }
    const linkPatterns = [
      /https?:\/\/(?:chat\.whatsapp\.com|wa\.me)\/\S+/gi,
      /^https?:\/\/(www\.)?whatsapp\.com\/channel\/([a-zA-Z0-9_-]+)$/,
      /wa\.me\/\S+/gi,
      /https?:\/\/(?:t\.me|telegram\.me)\/\S+/gi,
      /https?:\/\/(?:www\.)?youtube\.com\/\S+/gi,
      /https?:\/\/youtu\.be\/\S+/gi,
      /https?:\/\/(?:www\.)?facebook\.com\/\S+/gi,
      /https?:\/\/fb\.me\/\S+/gi,
      /https?:\/\/(?:www\.)?instagram\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?twitter\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?tiktok\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?linkedin\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?snapchat\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?pinterest\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?reddit\.com\/\S+/gi,
      /https?:\/\/ngl\/\S+/gi,
      /https?:\/\/(?:www\.)?discord\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?twitch\.tv\/\S+/gi,
      /https?:\/\/(?:www\.)?vimeo\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?dailymotion\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?medium\.com\/\S+/gi
    ];
    const containsLink = linkPatterns.some(pattern => pattern.test(body));

    if (containsLink && config.ANTILINK_KICK === 'true') {
      await conn.sendMessage(from, { 'delete': m.key }, { 'quoted': m });
      await conn.sendMessage(from, {
        'text': `⚠️ ʟɪɴᴋs ᴀʀᴇ ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ ɪɴ ᴛʜɪs ɢʀᴏᴜᴘ.\n@${sender.split('@')[0]} ʜᴀs ʙᴇᴇɴ ʀᴇᴍᴏᴠᴇᴅ. 🚫`,
        'mentions': [sender]
      }, { 'quoted': m });

      await conn.groupParticipantsUpdate(from, [sender], "remove");
    }
  } catch (error) {
    console.error(error);
    reply("An error occurred while processing the message.");
  }
});


//--------------------------------------------
//  ANI-BAD COMMANDS
//--------------------------------------------
cmd({
    pattern: "anti-bad",
    alias: ["antibadword"],
    desc: "enable or disable antibad.",
    category: "owner",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply, isOwner  }) => {
    if (!isOwner && !isCreator) return reply("_*❗ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴍʏ ᴏᴡɴᴇʀ !*_");

    const status = args[0]?.toLowerCase();
    // Check the argument for enabling or disabling the anticall feature
    if (args[0] === "on") {
        config.ANTI_BAD_WORD = "true";
        return reply("*ᴀɴᴛɪ ʙᴀᴅ ᴡᴏʀᴅ ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ.*");
    } else if (args[0] === "off") {
        config.ANTI_BAD_WORD = "false";
        return reply("*ᴀɴᴛɪ ʙᴀᴅ ᴡᴏʀᴅ ғᴇᴀᴛᴜʀᴇ ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ*");
    } else {
        return reply(`_ᴇxᴀᴍᴘʟᴇ:  .ᴀɴᴛɪʙᴀᴅ ᴏɴ_`);
    }
});
// Anti-Bad Words System
cmd({
  'on': "body"
}, async (conn, m, store, {
  from,
  body,
  isGroup,
  isAdmins,
  isBotAdmins,
  reply,
  sender
}) => {
  try {
    const badWords = ["wtf", "mia", "xxx", "سکس", "کوس", "غین", "کون", "fuck", 'sex', "huththa", "pakaya", 'ponnaya', "hutto"];

    if (!isGroup || isAdmins || !isBotAdmins) {
      return;
    }

    const messageText = body.toLowerCase();
    const containsBadWord = badWords.some(word => messageText.includes(word));

    if (containsBadWord && config.ANTI_BAD_WORD === "true") {
      await conn.sendMessage(from, { 'delete': m.key }, { 'quoted': m });
      await conn.sendMessage(from, { 'text': "🚫⚠️ 𝐁𝐀𝐃 𝐖𝐎𝐑𝐃𝐒 𝐍𝐎𝐓 𝐀𝐋𝐋𝐎𝐖𝐄𝐃 𝐈𝐍 ⚠️🚫" }, { 'quoted': m });
    }
  } catch (error) {
    console.error(error);
    reply("An error occurred while processing the message.");
  }
});



