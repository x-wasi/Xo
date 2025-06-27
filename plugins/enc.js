const { cmd } = require('../command');
const JsConfuser = require('js-confuser');

cmd({
  pattern: "enc",
  alias: ["encrypt"],
  desc: "Encrypt a .js file using hard obfuscation",
  category: "tools",
  react: "🔐",
  filename: __filename
}, async (dyby, m, text, { Owner }) => {
  if (!Owner) return m.reply('❌ ᴏɴʟʏ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜꜱᴇ ᴛʜɪꜱ ᴄᴏᴍᴍᴀɴᴅ.');

  const isQuotedJs = m.quoted?.mimetype === 'application/javascript';
  const originalName = m.quoted?.msg?.fileName || "unknown.js";

  if (!isQuotedJs || !originalName.endsWith('.js')) {
    return m.reply('❌ ᴘʟᴇᴀꜱᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀ .ᴊꜱ ꜰɪʟᴇ ᴛᴏ ᴇɴᴄʀʏᴘᴛ.');
  }

  try {
    const buffer = await m.quoted.download();
    if (!buffer) return m.reply('❌ ꜰᴀɪʟᴇᴅ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ ꜰɪʟᴇ.');

    await dyby.sendMessage(m.chat, {
      react: { text: '🔐', key: m.key }
    });

    const encryptedCode = await JsConfuser.obfuscate(buffer.toString(), {
      target: "node",
      preset: "high",
      compact: true,
      minify: true,
      flatten: true,
      identifierGenerator: () => {
        const base = "素DYBY晴TECH晴";
        const rand = (l) => Array(l).fill('').map(() =>
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".charAt(Math.floor(Math.random() * 52))
        ).join('');
        return base.replace(/[^a-zA-Z]/g, "") + rand(2);
      },
      renameVariables: true,
      renameGlobals: true,
      stringEncoding: true,
      stringSplitting: 0.0,
      stringConcealing: true,
      stringCompression: true,
      duplicateLiteralsRemoval: 1.0,
      shuffle: { hash: 0.0, true: 0.0 },
      stack: true,
      controlFlowFlattening: 1.0,
      opaquePredicates: 0.9,
      deadCode: 0.0,
      dispatcher: true,
      rgf: false,
      calculator: true,
      hexadecimalNumbers: true,
      movedDeclarations: true,
      objectExtraction: true,
      globalConcealing: true
    });

    const encryptedName = originalName.replace(/\.js$/i, '.enc.js');

    await dyby.sendMessage(m.chat, {
      document: Buffer.from(encryptedCode, 'utf-8'),
      mimetype: 'application/javascript',
      fileName: encryptedName,
      caption: `✅ *ғɪʟᴇ ᴇɴᴄʀʏᴘᴛᴇᴅ*\n• ɴᴇᴡ ɴᴀᴍᴇ: *${encryptedName}*\n• ᴛʏᴘᴇ: ʜᴀʀᴅ ᴏʙꜰᴜꜱᴄᴀᴛɪᴏɴ\n• ʙʏ: @ᴅʏʙʏ ᴛᴇᴄʜ`,
    }, { quoted: m });

  } catch (err) {
    console.error('Encryption Error:', err);
    return m.reply(`❌ *ᴇʀʀᴏʀ:* ${err.message}`);
  }
});
