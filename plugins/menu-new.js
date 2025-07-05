const config = require('../config');
const { cmd, commands } = require('../command');

cmd({
  pattern: "menu2",
  desc: "Interactive menu with categories",
  category: "menu",
  react: "🧾",
  filename: __filename
}, async (conn, mek, m, { from, sender }) => {
  try {
    // Catégories mappées à des numéros
    const categories = {
      '1': 'download',
      '2': 'group',
      '3': 'fun',
      '4': 'owner',
      '5': 'ai',
      '6': 'anime',
      '7': 'convert',
      '8': 'other',
      '9': 'reactions',
      '10': 'main'
    };

function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "🌅 ɢᴏᴏᴅ ᴍᴏʀɴɪɴɢ";
    if (hour >= 12 && hour < 18) return "🌞 ɢᴏᴏᴅ ᴀꜰᴛᴇʀɴᴏᴏɴ";
    return "🌙 ɢᴏᴏᴅ ᴇᴠᴇɴɪɴɢ";
}


    // Générer le menu principal
    const menuCaption = `*┌──◆*
*│ 『 𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃 』*
*└─┬◆*
*┌─┤ ${getGreeting()} 💫*
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

_ʀᴇᴘʟʏ ᴡɪᴛʜ ᴀ ɴᴜᴍʙᴇʀ (1–10) ᴛᴏ ᴠɪᴇᴡ ᴛʜᴇ sᴜʙᴍᴇɴᴜ._`;

    const contextInfo = {
      mentionedJid: [sender],
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363401051937059@newsletter',
        newsletterName: '𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃',
        serverMessageId: 143
      }
    };

    const sentMsg = await conn.sendMessage(from, {
      image: { url: 'https://files.catbox.moe/roubzi.jpg' },
      caption: menuCaption,
      contextInfo
    }, { quoted: mek });


    const messageID = sentMsg.key.id;

    // Générer dynamiquement les menus
    const menuData = {};
    for (const [key, category] of Object.entries(categories)) {
      const cmds = commands.filter(c => c.category === category && c.pattern && !c.hidden);
      const title = `📂 *${category.toUpperCase()} MENU*`;
      let content = `╭──『 ${title} 』\n`;

      for (const c of cmds) {
        content += `┃ .${c.pattern} — ${c.desc || 'Pas de description'}\n`;
      }

      content += `╰──────────────⊷`;
      menuData[key] = { title, content };
    }

    // Handler pour réponses utilisateurs
    const handler = async ({ messages }) => {
      try {
        const msg = messages?.[0];
        if (!msg?.message || msg.key.fromMe) return;

        const isReplyToMenu = msg.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID;
        if (!isReplyToMenu) return;

        const replyText = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        const selected = replyText.trim();

        if (!menuData[selected]) {
          return conn.sendMessage(from, {
            text: `❌ *ᴏᴘᴛɪᴏɴ ɪɴᴠᴀʟɪᴅᴇ !*\n\nRéponds ᴀᴠᴇᴄ ᴜɴ ɴᴜᴍéʀᴏ ᴇɴᴛʀᴇ 1 ᴇᴛ 10.`,
            contextInfo
          }, { quoted: msg });
        }

        const selectedMenu = menuData[selected];
        await conn.sendMessage(from, {
          text: `${selectedMenu.title}\n\n${selectedMenu.content}`,
          contextInfo
        }, { quoted: msg });

        await conn.sendMessage(from, {
          react: { text: '✅', key: msg.key }
        });
      } catch (e) {
        console.log("Erreur dans le menu dynamique :", e);
      }
    };

    // Activer l’écoute
    conn.ev.on("messages.upsert", handler);

    // Désactiver au bout de 5 min
    setTimeout(() => conn.ev.off("messages.upsert", handler), 300000);

  } catch (err) {
    console.error("Erreur menu2:", err);
    await conn.sendMessage(from, { text: "❌ Une erreur s’est produite." }, { quoted: mek });
  }
});
