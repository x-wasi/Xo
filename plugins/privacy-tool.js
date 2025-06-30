const fs = require("fs");
const config = require("../config");
const { cmd, commands } = require("../command");
const path = require('path');
const axios = require("axios");


cmd({
    pattern: "privacy",
    alias: ["privacymenu"],
    desc: "Privacy settings menu",
    category: "privacy",
    react: "🔐",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        let privacyMenu = `╭━━〔 *ᴘʀɪᴠᴀᴄʏ sᴇᴛᴛɪɴɢs* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• ʙʟᴏᴄᴋʟɪsᴛ - ᴠɪᴇᴡ ʙʟᴏᴄᴋᴇᴅ ᴜsᴇʀs
┃◈┃• ɢᴇᴛʙɪᴏ - ɢᴇᴛ ᴜsᴇʀ's ʙɪᴏ
┃◈┃• sᴇᴛᴘᴘᴀʟʟ - sᴇᴛ ᴘʀᴏғɪʟᴇ ᴘɪᴄ ᴘʀɪᴠᴀᴄʏ
┃◈┃• sᴇᴛᴏɴʟɪɴᴇ - sᴇᴛ ᴏɴʟɪɴᴇ ᴘʀɪᴠᴀᴄʏ
┃◈┃• sᴇᴛᴘᴘ - ᴄʜᴀɴɢᴇ ʙᴏᴛ's ᴘʀᴏғɪʟᴇ ᴘɪᴄ
┃◈┃• sᴇᴛᴍʏɴᴀᴍᴇ - ᴄʜᴀɴɢᴇ ʙᴏᴛ's ɴᴀᴍᴇ
┃◈┃• ᴜᴘᴅᴀᴛᴇʙɪᴏ - ᴄʜᴀɴɢᴇ ʙᴏᴛ's ʙɪᴏ
┃◈┃• ɢʀᴏᴜᴘsᴘʀɪᴠᴀᴄʏ - sᴇᴛ ɢʀᴏᴜᴘ ᴀᴅᴅ ᴘʀɪᴠᴀᴄʏ
┃◈┃• ɢᴇᴛᴘʀɪᴠᴀᴄʏ - ᴠɪᴇᴡ ᴄᴜʀʀᴇɴᴛ ᴘʀɪᴠᴀᴄʏ sᴇᴛᴛɪɴɢs
┃◈┃• ɢᴇᴛᴘᴘ - ɢᴇᴛ ᴜsᴇʀ's ᴘʀᴏғɪʟᴇ ᴘɪᴄᴛᴜʀᴇ
┃◈┃
┃◈┃*ᴏᴘᴛɪᴏɴs ғᴏʀ ᴘʀɪᴠᴀᴄʏ ᴄᴏᴍᴍᴀɴᴅs:*
┃◈┃• ᴀʟʟ - ᴇᴠᴇʀʏᴏɴᴇ
┃◈┃• ᴄᴏɴᴛᴀᴄᴛs - ᴍʏ ᴄᴏɴᴛᴀᴄᴛs ᴏɴʟʏ
┃◈┃• ᴄᴏɴᴛᴀᴄᴛ_ʙʟᴀᴄᴋʟɪsᴛ - ᴄᴏɴᴛᴀᴄᴛs ᴇxᴄᴇᴘᴛ ʙʟᴏᴄᴋᴇᴅ
┃◈┃• ɴᴏɴᴇ - ɴᴏʙᴏᴅʏ
┃◈┃• ᴍᴀᴛᴄʜ_ʟᴀsᴛ_sᴇᴇɴ - ᴍᴀᴛᴄʜ ʟᴀsᴛ sᴇᴇɴ
┃◈└───────────┈⊷
╰──────────────┈⊷
*ɴᴏᴛᴇ:* ᴍᴏsᴛ ᴄᴏᴍᴍᴀɴᴅs ᴀʀᴇ ᴏᴡɴᴇʀ-ᴏɴʟʏ`;

        await conn.sendMessage(
            from,
            {
                image: { url: `https://files.catbox.moe/w1l8b0.jpg` }, // Replace with privacy-themed image if available
                caption: privacyMenu,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401051937059@newsletter',
                        newsletterName: "Privacy Settings",
                        serverMessageId: 143
                    }
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        reply(`Error: ${e.message}`);
    }
});


cmd({
    pattern: "blocklist",
    desc: "View the list of blocked users.",
    category: "privacy",
    react: "📋",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply("*📛 You are not the owner!*");

    try {
        // Fetch the block list
        const blockedUsers = await conn.fetchBlocklist();

        if (blockedUsers.length === 0) {
            return reply("📋 Your block list is empty.");
        }

        // Format the blocked users with 📌 and count the total
        const list = blockedUsers
            .map((user, i) => `🚧 BLOCKED ${user.split('@')[0]}`) // Remove domain and add 📌
            .join('\n');

        const count = blockedUsers.length;
        reply(`📋 Blocked Users (${count}):\n\n${list}`);
    } catch (err) {
        console.error(err);
        reply(`❌ Failed to fetch block list: ${err.message}`);
    }
});

cmd({
    pattern: "getbio",
    desc: "Displays the user's bio.",
    category: "privacy",
    filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
    try {
        const jid = args[0] || mek.key.remoteJid;
        const about = await conn.fetchStatus?.(jid);
        if (!about) return reply("No bio found.");
        return reply(`User Bio:\n\n${about.status}`);
    } catch (error) {
        console.error("Error in bio command:", error);
        reply("No bio found.");
    }
});
cmd({
    pattern: "setppall",
    desc: "Update Profile Picture Privacy",
    category: "privacy",
    react: "🔐",
    filename: __filename
}, 
async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    
    try {
        const value = args[0] || 'all'; 
        const validValues = ['all', 'contacts', 'contact_blacklist', 'none'];  
        
        if (!validValues.includes(value)) {
            return reply("❌ Invalid option. Valid options are: 'all', 'contacts', 'contact_blacklist', 'none'.");
        }
        
        await conn.updateProfilePicturePrivacy(value);
        reply(`✅ ᴘʀᴏғɪʟᴇ ᴘɪᴄᴛᴜʀᴇ ᴘʀɪᴠᴀᴄʏ ᴜᴘᴅᴀᴛᴇᴅ to: ${value}`);
    } catch (e) {
        return reply(`*An error occurred while processing your request.*\n\n_Error:_ ${e.message}`);
    }
});
cmd({
    pattern: "setonline",
    desc: "Update Online Privacy",
    category: "privacy",
    react: "🔐",
    filename: __filename
}, 
async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");

    try {
        const value = args[0] || 'all'; 
        const validValues = ['all', 'match_last_seen'];
        
        if (!validValues.includes(value)) {
            return reply("❌ Invalid option. Valid options are: 'all', 'match_last_seen'.");
        }

        await conn.updateOnlinePrivacy(value);
        reply(`✅ ᴏɴʟɪɴᴇ ᴘʀɪᴠᴀᴄʏ ᴜᴘᴅᴀᴛᴇᴅ ᴛᴏ: ${value}`);
    } catch (e) {
        return reply(`*An error occurred while processing your request.*\n\n_Error:_ ${e.message}`);
    }
});



cmd({
    pattern: "updatebio",
    react: "🥏",
    desc: "Change the Bot number Bio.",
    category: "privacy",
    use: '.updatebio',
    filename: __filename
},
async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isOwner) return reply('🚫 *ʏᴏᴜ ᴍᴜsᴛ ʙᴇ ᴀɴ ᴏᴡɴᴇʀ ᴛᴏ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ*');
        if (!q) return reply('❓ *ᴇɴᴛᴇʀ ᴛʜᴇ ɴᴇᴡ ʙɪᴏ*');
        if (q.length > 139) return reply('❗ *sᴏʀʀʏ! ᴄʜᴀʀᴀᴄᴛᴇʀ ʟɪᴍɪᴛ ᴇxᴄᴇᴇᴅᴇᴅ*');
        await conn.updateProfileStatus(q);
        await conn.sendMessage(from, { text: "✔️ *ɴᴇᴡ ʙɪᴏ ᴀᴅᴅᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ*" }, { quoted: mek });
    } catch (e) {
        reply('🚫 *An error occurred!*\n\n' + e);
        l(e);
    }
});
cmd({
    pattern: "groupsprivacy",
    desc: "Update Group Add Privacy",
    category: "privacy",
    react: "🔐",
    filename: __filename
}, 
async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");

    try {
        const value = args[0] || 'all'; 
        const validValues = ['all', 'contacts', 'contact_blacklist', 'none'];
        
        if (!validValues.includes(value)) {
            return reply("❌ Invalid option. Valid options are: 'all', 'contacts', 'contact_blacklist', 'none'.");
        }

        await conn.updateGroupsAddPrivacy(value);
        reply(`✅ Group add privacy updated to: ${value}`);
    } catch (e) {
        return reply(`*An error occurred while processing your request.*\n\n_Error:_ ${e.message}`);
    }
});

cmd({
    pattern: "getprivacy",
    desc: "Get the bot Number Privacy Setting Updates.",
    category: "privacy",
    use: '.getprivacy',
    filename: __filename
},
async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isOwner) return reply('🚫 *ʏᴏᴜ ᴍᴜsᴛ ʙᴇ ᴀɴ ᴏᴡɴᴇʀ ᴛᴏ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ*');
        const duka = await conn.fetchPrivacySettings?.(true);
        if (!duka) return reply('🚫 *ғᴀɪʟᴇᴅ ᴛᴏ ғᴇᴛᴄʜ ᴘʀɪᴠᴀᴄʏ sᴇᴛᴛɪɴɢs*');
        
        let puka = `
╭───「 𝙿𝚁𝙸𝚅𝙰𝙲𝚈  」───◆  
│ ∘ 𝚁𝚎𝚊𝚍 𝚁𝚎𝚌𝚎𝚒𝚙𝚝: ${duka.readreceipts}  
│ ∘ 𝙿𝚛𝚘𝚏𝚒𝚕𝚎 𝙿𝚒𝚌𝚝𝚞𝚛𝚎: ${duka.profile}  
│ ∘ 𝚂𝚝𝚊𝚝𝚞𝚜: ${duka.status}  
│ ∘ 𝙾𝚗𝚕𝚒𝚗𝚎: ${duka.online}  
│ ∘ 𝙻𝚊𝚜𝚝 𝚂𝚎𝚎𝚗: ${duka.last}  
│ ∘ 𝙶𝚛𝚘𝚞𝚙 𝙿𝚛𝚒𝚟𝚊𝚌𝚢: ${duka.groupadd}  
│ ∘ 𝙲𝚊𝚕𝚕 𝙿𝚛𝚒𝚟𝚊𝚌𝚢: ${duka.calladd}  
╰────────────────────`;
        await conn.sendMessage(from, { text: puka }, { quoted: mek });
    } catch (e) {
        reply('🚫 *An error occurred!*\n\n' + e);
        l(e);
    }
});
