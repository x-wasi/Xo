const { cmd } = require('../command');
const config = require('../config');
const axios = require("axios");
const os = require('os');
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");


const SAFETY = {
  MAX_JIDS: 20,
  BASE_DELAY: 2000,  // davex on top 🔝
  EXTRA_DELAY: 4000,  // give credit mf 😐
};

cmd({
  pattern: "forward",
  alias: ["fwd"],
  desc: "Bulk forward media to groups",
  category: "tools",
  filename: __filename
}, async (client, message, match, { isCreator }) => {
  try {
    // Owner check
    if (!isCreator) return await message.reply("*📛 ᴏᴡɴᴇʀ ᴏɴʟʏ ᴄᴏᴍᴍᴀɴᴅ*");
    
    // Quoted message check
    if (!message.quoted) return await message.reply("*🍁 ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴍᴇssᴀɢᴇ*");

    // ===== [BULLETPROOF JID PROCESSING] ===== //
    let jidInput = "";
    
    // Handle all possible match formats
    if (typeof match === "string") {
      jidInput = match.trim();
    } else if (Array.isArray(match)) {
      jidInput = match.join(" ").trim();
    } else if (match && typeof match === "object") {
      jidInput = match.text || "";
    }
    
    // Extract JIDs (supports comma or space separated)
    const rawJids = jidInput.split(/[\s,]+/).filter(jid => jid.trim().length > 0);
    
    // Process JIDs (accepts with or without @g.us)
    const validJids = rawJids
      .map(jid => {
        const cleanJid = jid.replace(/(@g\.us|@s\.whatsapp\.net)$/i, "");
        if (!/^\d+$/.test(cleanJid)) return null;

        // تصمیم‌گیری براساس طول شماره: گروه یا شخصی
        if (cleanJid.length > 15) return `${cleanJid}@g.us`;  // group JID
        return `${cleanJid}@s.whatsapp.net`;                 // personal JID
      })
      .filter(jid => jid !== null)
      .slice(0, SAFETY.MAX_JIDS);

    if (validJids.length === 0) {
      return await message.reply(
        "❌ ɴᴏ ᴠᴀʟɪᴅ ɢʀᴏᴜᴘ ᴊɪᴅs ғᴏᴜɴᴅ\n" +
        "ᴇxᴀᴍᴘʟᴇs:\n" +
        ".ғᴡᴅ 120363411055156472@g.us,120363333939099948@g.us\n" +
        ".fwd 2349133354644"
      );
    }

    // ===== [ENHANCED MEDIA HANDLING - ALL TYPES] ===== //
    let messageContent = {};
    const mtype = message.quoted.mtype;
    
    // For media messages (image, video, audio, sticker, document)
    if (["imageMessage", "videoMessage", "audioMessage", "stickerMessage", "documentMessage"].includes(mtype)) {
      const buffer = await message.quoted.download();
      
      switch (mtype) {
        case "imageMessage":
          messageContent = {
            image: buffer,
            caption: message.quoted.text || '',
            mimetype: message.quoted.mimetype || "image/jpeg"
          };
          break;
        case "videoMessage":
          messageContent = {
            video: buffer,
            caption: message.quoted.text || '',
            mimetype: message.quoted.mimetype || "video/mp4"
          };
          break;
        case "audioMessage":
          messageContent = {
            audio: buffer,
            mimetype: message.quoted.mimetype || "audio/mp4",
            ptt: message.quoted.ptt || false
          };
          break;
        case "stickerMessage":
          messageContent = {
            sticker: buffer,
            mimetype: message.quoted.mimetype || "image/webp"
          };
          break;
        case "documentMessage":
          messageContent = {
            document: buffer,
            mimetype: message.quoted.mimetype || "application/octet-stream",
            fileName: message.quoted.fileName || "document"
          };
          break;
      }
    } 
    // For text messages
    else if (mtype === "extendedTextMessage" || mtype === "conversation") {
      messageContent = {
        text: message.quoted.text
      };
    } 
    // For other message types (forwarding as-is)
    else {
      try {
        // Try to forward the message directly
        messageContent = message.quoted;
      } catch (e) {
        return await message.reply("❌ ᴜɴsᴜᴘᴘᴏʀᴛᴇᴅ ᴍᴇssᴀɢᴇ ᴛʏᴘᴇ");
      }
    }

    // ===== [OPTIMIZED SENDING WITH PROGRESS] ===== //
    let successCount = 0;
    const failedJids = [];
    
    for (const [index, jid] of validJids.entries()) {
      try {
        await client.sendMessage(jid, messageContent);
        successCount++;
        
        // Progress update (every 10 groups instead of 5)
        if ((index + 1) % 10 === 0) {
          await message.reply(`🔄 sᴇɴᴛ ᴛᴏ ${index + 1}/${validJids.length} ɢʀᴏᴜᴘs...`);
        }
        
        // Apply reduced delay
        const delayTime = (index + 1) % 10 === 0 ? SAFETY.EXTRA_DELAY : SAFETY.BASE_DELAY;
        await new Promise(resolve => setTimeout(resolve, delayTime));
        
      } catch (error) {
        failedJids.push(jid.replace('@g.us', ''));
        await new Promise(resolve => setTimeout(resolve, SAFETY.BASE_DELAY));
      }
    }

    // ===== [COMPREHENSIVE REPORT] ===== //
    let report = `✅ *ғᴏʀᴡᴀʀᴅ ᴄᴏᴍᴘʟᴇᴛᴇ*\n\n` +
                 `📤 sᴜᴄᴄᴇss: ${successCount}/${validJids.length}\n` +
                 `📦 ᴄᴏɴᴛᴇɴᴛ ᴛʏᴘᴇ: ${mtype.replace('Message', '') || 'text'}\n`;
    
    if (failedJids.length > 0) {
      report += `\n❌ Failed (${failedJids.length}): ${failedJids.slice(0, 5).join(', ')}`;
      if (failedJids.length > 5) report += ` +${failedJids.length - 5} more`;
    }
    
    if (rawJids.length > SAFETY.MAX_JIDS) {
      report += `\n⚠️ ɴᴏᴛᴇ: ʟɪᴍɪᴛᴇᴅ ᴛᴏ ғɪʀsᴛ ${SAFETY.MAX_JIDS} ᴊɪᴅs`;
    }

    await message.reply(report);

  } catch (error) {
    console.error("Forward Error:", error);
    await message.reply(
      `💢 Error: ${error.message.substring(0, 100)}\n\n` +
      `ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ ᴏʀ ᴄʜᴇᴄᴋ:\n` +
      `1. ᴊɪᴅ ғᴏʀᴍᴀᴛᴛɪɴɢ\n` +
      `2. ᴍᴇᴅɪᴀ ᴛʏᴘᴇ sᴜᴘᴘᴏʀᴛ\n` +
      `3. ʙᴏᴛ ᴘᴇʀᴍɪssɪᴏɴs`
    );
  }
});
