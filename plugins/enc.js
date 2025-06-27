const { cmd } = require('../command');
const JsConfuser = require('js-confuser');

cmd({
  pattern: "enc",
  alias: ["encrypt"],
  desc: "Encrypt a .js file using hard obfuscation",
  category: "tools",
  react: "🔐",
  filename: __filename
}, async (dybytech, m, text, { Owner }) => {
  if (!Owner) return m.reply('❌ ᴏɴʟʏ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜꜱᴇ ᴛʜɪꜱ ᴄᴏᴍᴍᴀɴᴅ.');

  const quoted = m.quoted || m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const fileInfo = quoted?.documentMessage;

  if (!fileInfo || !fileInfo.fileName.endsWith('.js')) {
    return m.reply('❌ ᴘʟᴇᴀꜱᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀ .ᴊꜱ ꜰɪʟᴇ ᴛᴏ ᴇɴᴄʀʏᴘᴛ.');
  }

  try {
    const fileName = fileInfo.fileName;
    const docBuffer = await m.quoted.download();
    if (!docBuffer) return m.reply('❌ ᴄᴀɴ’ᴛ ᴅᴏᴡɴʟᴏᴀᴅ ꜰɪʟᴇ.');

    await dybytech.sendMessage(m.chat, {
      react: { text: '🔐', key: m.key }
    });

    const obfuscatedCode = await JsConfuser.obfuscate(docBuffer.toString(), {
      target: "node",
      preset: "high",
      compact: true,
      minify: true,
      flatten: true,
      identifierGenerator: () => {
        const base = "素DYBY晴TECH晴";
        const randomString = (len) => Array(len).fill('').map(() =>
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".charAt(Math.floor(Math.random() * 52))
        ).join('');
        return base.replace(/[^a-zA-Z]/g, "") + randomString(2);
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

    await dybytech.sendMessage(m.chat, {
      document: Buffer.from(obfuscatedCode, 'utf-8'),
      mimetype: 'application/javascript',
      fileName,
      caption: `✅ *sᴜᴄᴄᴇꜱꜱғᴜʟʟʏ ᴇɴᴄʀʏᴘᴛᴇᴅ*\n• ᴛʏᴘᴇ: ʜᴀʀᴅ ᴄᴏᴅᴇ\n• ᴄʀᴇᴀᴛᴇᴅ ʙʏ: @ᴅʏʙʏ ᴛᴇᴄʜ`,
    }, { quoted: m });

  } catch (error) {
    console.error('Encryption Error:', error);
    await m.reply(`❌ *ᴇʀʀᴏʀ:* ${error.message}`);
  }
});
