const config = require('../config');
const { cmd, commands } = require('../command');

const menuMap = {
    "1": "download",
    "2": "group",
    "3": "fun",
    "4": "owner",
    "5": "ai",
    "6": "anime",
    "7": "convert",
    "8": "other",
    "9": "reactions",
    "10": "main"
};

function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "🌅 ɢᴏᴏᴅ ᴍᴏʀɴɪɴɢ";
    if (hour >= 12 && hour < 18) return "🌞 ɢᴏᴏᴅ ᴀꜰᴛᴇʀɴᴏᴏɴ";
    return "🌙 ɢᴏᴏᴅ ᴇᴠᴇɴɪɴɢ";
}
// Mémoire temporaire des derniers menus envoyés
let lastMenuMessage = {};

cmd({
    pattern: "menu2",
    react: "👾",
    desc: "get cmd list",
    category: "main",
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, pushname, sender, reply
}) => {
    try {
        let menu = {};
        for (let i = 0; i < commands.length; i++) {
            if (commands[i].pattern && !commands[i].dontAddCommandList) {
                let cat = commands[i].category || 'other';
                if (!menu[cat]) menu[cat] = '';
                menu[cat] += `*┋* ${commands[i].pattern}\n`;
            }
        }

        let madeMenu = `*┌──◆*
*│ 『 𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃 』*
*└─┬◆*
*┌─┤ ${getGreeting()} 💫*
*│  ╰────────────────╯*
*│◓ ᴜsᴇʀ : ${pushname}
*│◓ ᴏᴡɴᴇʀ : ${config.OWNER_NAME}*
*│◓ ʙᴀɪʟᴇʏs : ᴍᴜʟᴛɪ ᴅᴇᴠɪᴄᴇ*
*│◓ ᴛʏᴘᴇ : ɴᴏᴅᴇᴊs*
*│◓ ᴅᴇᴠ : ᴅʏʙʏ ᴛᴇᴄʜ
*│◓ ᴍᴏᴅᴇ : private*
*│◓ ᴘʀᴇғɪx : 「 ${config.PREFIX} 」
*│◓ ᴠᴇʀsɪᴏɴ : 1.0.0 ʙᴇᴛᴀ*
*╰─────────────────⊷*

> *╭∘━━➣* *𝐌𝐄𝐍𝐔 *
> *│☆* ❶ *ᴅᴏᴡɴʟᴏᴀᴅ ᴍᴇɴᴜ*
> *│☆* ❷ *ɢʀᴏᴜᴘ ᴍᴇɴᴜ*
> *│☆* ❸ *ғᴜɴ ᴍᴇɴᴜ*
> *│☆* ❹ *ᴏᴡɴᴇʀ ᴍᴇɴᴜ*
> *│☆* ❺ *ᴀɪ ᴍᴇɴᴜ*
> *│☆* ❻ *ᴀɴɪᴍᴇ ᴍᴇɴᴜ*
> *│☆* ❼ *ᴄᴏɴᴠᴇʀᴛ ᴍᴇɴᴜ*
> *│☆* ❽ *ᴏᴛʜᴇʀ ᴍᴇɴᴜ*
> *│☆* ❾ *ʀᴇᴀᴄᴛɪᴏɴs ᴍᴇɴᴜ*
> *│☆* ➓ *ᴍᴀɪɴ ᴍᴇɴᴜ*
> *╰─────────────┈⊷*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*
`;

        let allMenus = ``;
        const orderedCategories = ['main', 'download', 'group', 'owner', 'convert', 'search', 'fun', 'ai', 'anime', 'other', 'reactions'];
        for (const cat of orderedCategories) {
            if (menu[cat]) {
                allMenus += `╭── 【 *${cat.toUpperCase()} MENU* 】 ───╮\n${menu[cat]}╰───────────────────────────────⊷\n\n`;
            }
        }

        let sent = await conn.sendMessage(
            from,
            {
                image: { url: `https://files.catbox.moe/roubzi.jpg` },
                caption: madeMenu + '\n\n_ʀᴇᴘʟʏ ᴡɪᴛʜ ᴀ ɴᴜᴍʙᴇʀ (1–10) ᴛᴏ ᴏᴘᴇɴ ᴛʜᴀᴛ ᴍᴇɴᴜ._',
                contextInfo: {
                    mentionedJid: [sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401051937059@newsletter',
                        newsletterName: '𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃',
                        serverMessageId: 143
                    }
                }
            },
            { quoted: mek }
        );

        // Save message ID
        lastMenuMessage[from] = sent.key.id;

    } catch (e) {
        console.error(e);
        reply(`❌ Error:\n${e}`);
    }
});

// Écoute des réponses à `.menu2`
conn.ev.on("messages.upsert", async ({ messages }) => {
    try {
        let msg = messages[0];
        if (!msg.message || msg.key.fromMe || msg.key.remoteJid === 'status@broadcast') return;

        const from = msg.key.remoteJid;
        const reply_to = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;

        // Si on répond au menu envoyé
        if (reply_to && lastMenuMessage[from] && reply_to === lastMenuMessage[from]) {
            let body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
            body = body.trim();
            if (menuMap[body]) {
                let category = menuMap[body];
                let cmds = commands.filter(cmd => cmd.category === category && cmd.pattern && !cmd.dontAddCommandList);
                if (!cmds.length) return conn.sendMessage(from, { text: `❌ ɴᴏ ᴄᴏᴍᴍᴀɴᴅs ғᴏᴜɴᴅ ɪɴ *${category} ᴍᴇɴᴜ*.` }, { quoted: msg });

                let text = `╭───〔 *${category.toUpperCase()} MENU* 〕───╮\n`;
                for (let cmd of cmds) {
                    text += `┃◈ ${cmd.pattern}\n`;
                }
                text += `╰───────────────────────────⊷\n> *ʀᴇǫᴜᴇsᴛᴇᴅ ʙʏ ${msg.pushName || 'User'}*`;

                await conn.sendMessage(from, { text }, { quoted: msg });
            }
        }
    } catch (err) {
        console.error("ᴇʀʀᴏʀ ɪɴ ᴍᴇɴᴜ ʀᴇᴘʟʏ ʜᴀɴᴅʟᴇʀ:", err);
    }
});
