const { cmd } = require("../command");
const config = require("../config");
const fs = require("fs");

// 📌 Commande .antivv on / off
cmd({
    pattern: "antivv",
    alias: ["anti-viewonce", "antiviewonce"],
    desc: "Enable or disable automatic view-once opening",
    category: "settings",
    filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.ANTIVV = "true";
        return reply("✅ ᴀɴᴛɪ ᴠɪᴇᴡ ᴏɴᴄᴇ ɪs ɴᴏᴡ *ᴇɴᴀʙʟᴇᴅ*.");
    } else if (status === "off") {
        config.ANTIVV = "false";
        return reply("❌ ᴀɴᴛɪ ᴠɪᴇᴡ ᴏɴᴄᴇ ɪs ɴᴏᴡ *ᴅɪsᴀʙʟᴇᴅ*.");
    } else {
        return reply(`❓ ᴇxᴀᴍᴘʟᴇ: *.ᴀɴᴛɪᴠᴠ ᴏɴ* / *.ᴀɴᴛɪᴠᴠ ᴏғғ*\n📌 ᴄᴜʀʀᴇɴᴛ: ${config.ANTIVV === "true" ? "✅ ᴇɴᴀʙʟᴇᴅ" : "❌ ᴅɪsᴀʙʟᴇᴅ"}`);
    }
});

// 📌 Auto-ouverture des vues uniques
module.exports = {
    name: "antivv_auto",
    event: "messages.upsert",
    async handler(client, update) {
        if (config.ANTIVV !== "true") return;

        try {
            const msg = update.messages?.[0];
            if (!msg?.message) return;

            const viewOnceMsg = msg.message?.viewOnceMessageV2 || msg.message?.viewOnceMessage;
            if (!viewOnceMsg) return;

            const innerMsg = viewOnceMsg.message;
            const type = Object.keys(innerMsg)[0];
            if (!["imageMessage", "videoMessage"].includes(type)) return;

            const { downloadMediaMessage } = require("@whiskeysockets/baileys");
            const buffer = await downloadMediaMessage(
                { message: { message: innerMsg }, key: msg.key },
                "buffer",
                {},
                { reuploadRequest: client.updateMediaMessage }
            );

            const caption = `👀 *View Once Opened Automatically*\n👤 From: @${msg.key.participant?.split("@")[0] || msg.key.remoteJid.split("@")[0]}`;
            const mentions = [msg.key.participant || msg.key.remoteJid];

            if (type === "imageMessage") {
                await client.sendMessage(msg.key.remoteJid, { image: buffer, caption, mentions }, { quoted: msg });
            } else {
                await client.sendMessage(msg.key.remoteJid, { video: buffer, caption, mentions }, { quoted: msg });
            }
        } catch (err) {
            console.error("❌ AntiVV Error:", err);
        }
    }
};
