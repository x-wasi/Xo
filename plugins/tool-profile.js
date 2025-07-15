const { cmd } = require('../command');
const { getBuffer, fetchJson } = require('../lib/functions');

cmd({
    pattern: "whois",
    react: "👤",
    alias: ["userinfo", "profile", "person"],
    desc: "Get complete user profile information",
    category: "utility",
    use: '.whois [@tag | reply | number]',
    filename: __filename
},
async (conn, mek, m, { from, sender, message, isGroup, args, reply, quoted, participants }) => {
    try {
        // 1. DETERMINE TARGET USER
        let userJid;

        if (m.mentionedJid?.length) {
            userJid = m.mentionedJid[0];
        } else if (quoted && quoted.sender) {
            userJid = quoted.sender;
        } else if (/^\d{5,20}$/.test(args[0])) {
            userJid = args[0] + '@s.whatsapp.net';
        } else {
            userJid = sender;
        }

        // 2. VERIFY USER EXISTS
        const [user] = await conn.onWhatsApp(userJid).catch(() => []);
        if (!user?.exists) return reply("❌ User not found on WhatsApp");

        // 3. GET PROFILE PICTURE
        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(userJid, 'image');
        } catch {
            ppUrl = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';
        }

        // 4. GET NAME
        let userName = userJid.split('@')[0];
        try {
            if (isGroup) {
                const member = participants.find(p => p.id === userJid);
                if (member?.notify) userName = member.notify;
            }

            if (userName === userJid.split('@')[0] && conn.contactDB) {
                const contact = await conn.contactDB.get(userJid).catch(() => null);
                if (contact?.name) userName = contact.name;
            }

            if (userName === userJid.split('@')[0]) {
                const presence = await conn.presenceSubscribe(userJid).catch(() => null);
                if (presence?.pushname) userName = presence.pushname;
            }
        } catch (e) {
            console.log("Name fetch error:", e);
        }

        // 5. GET BIO / STATUS
        let bio = {};
        try {
            const statusData = await conn.fetchStatus(userJid).catch(() => null);
            if (statusData?.status) {
                bio = {
                    text: statusData.status,
                    type: "Personal",
                    updated: statusData.setAt ? new Date(statusData.setAt * 1000) : null
                };
            } else {
                const businessProfile = await conn.getBusinessProfile(userJid).catch(() => null);
                if (businessProfile?.description) {
                    bio = {
                        text: businessProfile.description,
                        type: "Business",
                        updated: null
                    };
                }
            }
        } catch (e) {
            console.log("Bio fetch error:", e);
        }

        // 6. GROUP ROLE
        let groupRole = "";
        if (isGroup) {
            const participant = participants.find(p => p.id === userJid);
            groupRole = participant?.admin ? "👑 ᴀᴅᴍɪɴ" : "👥 ᴍᴇᴍʙᴇʀ";
        }

        // 7. FORMAT INFO
        const formattedBio = bio.text ? 
            `${bio.text}\n└─ 📌 ${bio.type} ʙɪᴏ${bio.updated ? ` | 🕒 ${bio.updated.toLocaleString()}` : ''}` : 
            "No bio available";

        const userInfo = `
🎯 𝐔𝐒𝐄𝐑 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍*

 📛 *ɴᴀᴍᴇ:* ${userName}
 🔢 *ɴᴜᴍʙᴇʀ:* ${userJid.replace(/@.+/, '')}
 📌 *ᴀᴄᴄᴏᴜɴᴛ ᴛʏᴘᴇ:* ${user.isBusiness ? "💼 ʙᴜsɪɴᴇss" : user.isEnterprise ? "🏢 ᴇɴᴛᴇʀᴘʀɪsᴇ" : "👤 ᴘᴇʀsᴏɴᴀʟ"}
 ✅ *ʀᴇɢɪsᴛᴇʀᴇᴅ:* ${user.isUser ? "Yes" : "No"}
 🛡️ *ᴠᴇʀɪғɪᴇᴅ:* ${user.verifiedName ? "✅ ᴠᴇʀɪғɪᴇᴅ" : "❌ ɴᴏᴛ ᴠᴇʀɪғɪᴇᴅ"}
${isGroup ? `│ 👥 *ɢʀᴏᴜᴘ ʀᴏʟᴇ:* ${groupRole}` : ''}

📝 ᴀʙᴏᴜᴛ:* ${formattedBio}
        `.trim();

        // 8. SEND
        await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption: userInfo,
            mentions: [userJid]
        }, { quoted: mek });

    } catch (e) {
        console.error("whois error:", e);
        reply(`❌ Error: ${e.message || "Failed to fetch profile info."}`);
    }
});
