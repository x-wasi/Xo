const config = require('../config');
const { cmd } = require('../command');

// Map de correspondance des numéros -> catégories
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

// Saluer selon l'heure
function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "🌅 ɢᴏᴏᴅ ᴍᴏʀɴɪɴɢ";
    if (hour >= 12 && hour < 18) return "🌞 ɢᴏᴏᴅ ᴀꜰᴛᴇʀɴᴏᴏɴ";
    return "🌙 ɢᴏᴏᴅ ᴇᴠᴇɴɪɴɢ";
}

// Enregistrement des derniers ID de menu envoyés par salon
const menuMessageIds = {};

cmd({
  pattern: "menu2",
  react: "📘",
  desc: "Show interactive category menu",
  category: "main",
  filename: __filename
}, async (conn, mek, m, { from, pushname, sender, reply }) => {
  try {
    // Générer la liste des commandes par catégorie
    let menu = {};
    for (let i = 0; i < commands.length; i++) {
      if (commands[i].pattern && !commands[i].dontAddCommandList) {
        let cat = commands[i].category || 'other';
        if (!menu[cat]) menu[cat] = '';
        menu[cat] += `┃◈ ${commands[i].pattern}\n`;
      }
    }

    // Texte du menu principal
    let madeMenu = `*┌──◆*
*│ 『 𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃 』*
*└─┬◆*
*┌─┤ ${getGreeting()}*
*│  ╰────────────────╯*
*│◓ ᴜsᴇʀ : ${pushname}
*│◓ ᴏᴡɴᴇʀ : ${config.OWNER_NAME}*
*│◓ ʙᴀɪʟᴇʏs : ᴍᴜʟᴛɪ ᴅᴇᴠɪᴄᴇ*
*│◓ ᴛʏᴘᴇ : ɴᴏᴅᴇᴊs*
*│◓ ᴅᴇᴠ : ᴅʏʙʏ ᴛᴇᴄʜ
*│◓ ᴍᴏᴅᴇ : ${config.MODE}*
*│◓ ᴘʀᴇғɪx : 「 ${config.PREFIX} 」
*│◓ ᴠᴇʀsɪᴏɴ : 1.0.0 ʙᴇᴛᴀ*
*╰─────────────────⊷*

> *╭∘━━* *𝐌𝐄𝐍𝐔 *
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

    // Envoyer le menu avec image
    const sentMsg = await conn.sendMessage(from, {
      image: { url: `https://files.catbox.moe/roubzi.jpg` },
      caption: madeMenu + `\n\nʀᴇᴘʟʏ ᴡɪᴛʜ ᴀ ɴᴜᴍʙᴇʀ (1–10) ᴛᴏ ᴏᴘᴇɴ ᴛʜᴀᴛ ᴍᴇɴᴜ.`,
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
    }, { quoted: mek });

    // Enregistre l'ID du message pour ce salon
    if (!menuMessageIds[from]) menuMessageIds[from] = [];
    menuMessageIds[from].push(sentMsg.key.id);

  } catch (e) {
    console.error("Error in menu2:", e);
    reply("An error occurred while displaying the menu.");
  }
});

// Écouteur permanent (illimité)
conn.ev.on("messages.upsert", async ({ messages }) => {
  try {
    const msg = messages?.[0];
    if (!msg?.message || msg.key.fromMe || msg.key.remoteJid === 'status@broadcast') return;

    const from = msg.key.remoteJid;
    const reply_to = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    const selected = text.trim();

    // Si réponse à un menu connu
    if (reply_to && menuMessageIds[from]?.includes(reply_to)) {
      if (!menuMap[selected]) {
        return conn.sendMessage(from, {
          text: "ɪɴᴠᴀʟɪᴅ ᴏᴘᴛɪᴏɴ. ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴡɪᴛʜ ᴀ ɴᴜᴍʙᴇʀ ғʀᴏᴍ 1 ᴛᴏ 10."
        }, { quoted: msg });
      }

      const category = menuMap[selected];
      const cmds = commands.filter(cmd => cmd.category === category && cmd.pattern && !cmd.dontAddCommandList);

      if (!cmds.length) {
        return conn.sendMessage(from, {
          text: `ɴᴏ ᴄᴏᴍᴍᴀɴᴅs ғᴏᴜɴᴅ ɪɴ "${category}" menu.`
        }, { quoted: msg });
      }

      let text = `╭───〔 *${category.toUpperCase()} MENU* 〕───╮\n`;
                for (let cmd of cmds) {
                    text += `┃◈ ${cmd.pattern}\n`;
                }
                text += `╰──────────────────────⊷\n`;

      result += `\n ʀᴇǫᴜᴇsᴛᴇᴅ ʙʏ: ${msg.pushName || msg.key.participant?.split('@')[0]}`;
      await conn.sendMessage(from, { text: result }, { quoted: msg });
    }

  } catch (err) {
    console.error("Error in menu2 reply handler:", err);
  }
});
