const { cmd } = require('../command');
const JsConfuser = require('js-confuser');
const axios = require('axios');

cmd({
  pattern: "enc",
  alias: ["encrypt"],
  desc: "Encrypt a .js file using hard obfuscation",
  category: "tools",
  react: "🔐",
  filename: __filename
}, async (dyby, m, text, { Owner }) => {
  try {
    if (!Owner) return m.reply('❌ ᴏɴʟʏ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜꜱᴇ ᴛʜɪꜱ ᴄᴏᴍᴍᴀɴᴅ.');

    const quoted = m.quoted;

    console.log("==== DEBUG START ====");
    console.log("quoted:", quoted);
    console.log("mimetype:", quoted?.mimetype);
    console.log("fileName:", quoted?.msg?.fileName);
    console.log("download() exists:", typeof quoted?.download);
    console.log("url:", quoted?.msg?.url || quoted?.downloadUrl);
    console.log("==== DEBUG END ====");

    const mime = quoted?.mimetype;
    const fileName = quoted?.msg?.fileName || "file.js";
    const url = quoted?.msg?.url || quoted?.downloadUrl;

    if (!quoted || mime !== 'application/javascript' || !fileName.endsWith('.js')) {
      return m.reply('❌ ᴘʟᴇᴀꜱᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴠᴀʟɪᴅ .ᴊꜱ ꜰɪʟᴇ (ᴀꜱ ᴅᴏᴄᴜᴍᴇɴᴛ).');
    }

    let buffer;

    try {
      buffer = await quoted.download();
    } catch (err) {
      console.warn("❌ ERROR in quoted.download(), fallback to axios:", err?.message || err);

      if (!url) return m.reply("❌ ɴᴏ ᴜʀʟ ꜰᴏᴜɴᴅ ᴛᴏ ꜰᴀʟʟʙᴀᴄᴋ ᴅᴏᴡɴʟᴏᴀᴅ.");

      try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        buffer = response.data;
      } catch (e) {
        console.error("❌ Axios download error:", e?.message || e);
        return m.reply("❌ ᴇʀʀᴏʀ ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ꜰɪʟᴇ: " + (e?.message || e));
      }
    }

    if (!buffer || buffer.length === 0) {
      return m.reply('❌ ꜰɪʟᴇ ɪꜱ ᴇᴍᴘᴛʏ ᴏʀ ɴᴜʟʟ.');
    }

    await dyby.sendMessage(m.chat, {
      react: { text: '🔐', key: m.key }
    });

    const obfuscated = await JsConfuser.obfuscate(buffer.toString(), {
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

    const encryptedName = fileName.replace(/\.js$/i, '.enc.js');

    await dyby.sendMessage(m.chat, {
      document: Buffer.from(obfuscated, 'utf-8'),
      mimetype: 'application/javascript',
      fileName: encryptedName,
      caption: `✅ *ғɪʟᴇ ᴇɴᴄʀʏᴘᴛᴇᴅ*\n• ɴᴇᴡ ɴᴀᴍᴇ: *${encryptedName}*\n• ᴛʏᴘᴇ: ʜᴀʀᴅ ᴏʙꜰᴜꜱᴄᴀᴛɪᴏɴ\n• ʙʏ: @ᴅʏʙʏ ᴛᴇᴄʜ`,
    }, { quoted: m });

  } catch (err) {
    console.error("💥 FINAL ERROR:", err);
    await m.reply(`❌ *ᴜɴᴇxᴘᴇᴄᴛᴇᴅ ᴇʀʀᴏʀ:* ${err.message || err}`);
  }
});
