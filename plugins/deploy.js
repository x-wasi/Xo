const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');
const { File } = require('megajs');
const { default: makeWASocket } = require('baileys');

// Mémoire des sessions jadibot actives
global.jadibotSessions = global.jadibotSessions || {};

cmd({
  pattern: 'deploy',
  desc: 'Deploy your own WhatsApp session (Jadibot-style) using a MEGALODON~MD~ session ID from MEGA.nz',
  category: 'tools',
  react: '🤖',
  filename: __filename
}, async (conn, m, { text }) => {
  if (!text) {
    return m.reply('❌ Provide your session ID.\n\nExample:\n.deploy MEGALODON~MD~<file_id>#<key>');
  }

  const match = text.trim().match(/^MEGALODON~MD~([a-zA-Z0-9_-]+)#([a-zA-Z0-9_-]+)$/);
  if (!match) {
    return m.reply('❌ Invalid format. Use:\n.deploy MEGALODON~MD~<file_id>#<key>');
  }

  const fileId = match[1];
  const fileKey = match[2];

  if (global.jadibotSessions[fileId]) {
    return m.reply('⚠️ This session is already active.');
  }

  if (Object.keys(global.jadibotSessions).length >= 10) {
    return m.reply('⚠️ Maximum number of active Jadibot sessions reached (10).');
  }

  try {
    m.reply(`📥 Downloading session from MEGA...\nFile ID: ${fileId}`);

    const megaUrl = `https://mega.nz/#!${fileId}!${fileKey}`;
    const file = File.fromURL(megaUrl);
    const stream = await file.download();
    const chunks = [];

    for await (const chunk of stream) chunks.push(chunk);
    const sessionBuffer = Buffer.concat(chunks);

    let sessionJson;
    try {
      sessionJson = JSON.parse(sessionBuffer.toString());
    } catch (err) {
      return m.reply('❌ Session file is not a valid JSON.');
    }

    const sock = makeWASocket({
      auth: {
        creds: sessionJson.creds,
        keys: sessionJson.keys || {}
      },
      printQRInTerminal: false
    });

    global.jadibotSessions[fileId] = sock;

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === 'close') {
        delete global.jadibotSessions[fileId];
        console.log(`🔴 Session ${fileId} disconnected.`);
      } else if (connection === 'open') {
        console.log(`🟢 Session ${fileId} connected.`);
        m.reply(`✅ Your Jadibot session **${fileId}** is now connected!`);
      }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
      const msg = messages[0];
      if (!msg?.message) return;
      const from = msg.key.remoteJid;
      const isGroup = from.endsWith('@g.us');
      const sender = isGroup ? msg.key.participant : from;

      // Exemple : Répond automatiquement à "ping"
      const textMsg = msg.message.conversation || msg.message.extendedTextMessage?.text;
      if (textMsg?.toLowerCase() === 'ping') {
        await sock.sendMessage(from, { text: 'pong 🏓' }, { quoted: msg });
      }
    });

    m.reply(`🤖 Connecting your session... Please wait.`);

  } catch (e) {
    console.error(e);
    m.reply(`❌ Error while deploying session: ${e.message}`);
  }
});