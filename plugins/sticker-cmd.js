const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');
const config = require('../config.js');

// Dossier de données
const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Fichier JSON où sont stockées les associations sticker → commande
const STICKER_COMMANDS_FILE = path.join(DATA_DIR, 'sticker-commands.json');
if (!fs.existsSync(STICKER_COMMANDS_FILE)) fs.writeFileSync(STICKER_COMMANDS_FILE, '{}', 'utf8');

// Charger les commandes
const loadStickerCommands = () => {
  try {
    if (fs.existsSync(STICKER_COMMANDS_FILE)) {
      return JSON.parse(fs.readFileSync(STICKER_COMMANDS_FILE, 'utf8'));
    }
    return {};
  } catch (err) {
    console.error('Error loading sticker commands:', err);
    return {};
  }
};

// Sauvegarder les commandes
const saveStickerCommands = (data) => {
  try {
    fs.writeFileSync(STICKER_COMMANDS_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving sticker commands:', err);
  }
};

// Associer une commande à un sticker
cmd({
  pattern: 'setcmd',
  desc: 'Link a sticker to a command',
  category: 'sticker',
  filename: __filename
}, async (conn, m, text, { args, reply, isCreator }) => {
  if (!isCreator) return reply('❌ This command is only for the bot creator!');
  if (!args[0]) return reply('❌ Please provide a command to bind.\n\nExample: .setcmd menu');
  if (!m.quoted || m.quoted.mtype !== 'stickerMessage') return reply('❌ Please reply to a sticker');

  const command = args.join(' ').replace(/^[./!#?&^:;`~+=\-,_]/, '');

  const stickerMessage = m.quoted.msg?.contextInfo?.quotedMessage?.stickerMessage;
  if (!stickerMessage) return reply('❌ Could not retrieve the sticker data.');

  let fileSha = null;
  if (stickerMessage.fileSha256) {
    fileSha = Buffer.from(stickerMessage.fileSha256).toString('base64');
  } else if (stickerMessage.mediaKey) {
    fileSha = Buffer.from(stickerMessage.mediaKey).toString('base64');
  }

  if (!fileSha) return reply('❌ Could not get sticker identifier.');

  const db = loadStickerCommands();
  db[fileSha] = command;
  saveStickerCommands(db);

  await reply(`✅ Successfully bound sticker to the command: *${config.PREFIX}${command}*`);
});

// Lister les stickers liés à une commande
cmd({
  pattern: 'listcmd',
  desc: 'List all sticker command bindings',
  category: 'sticker',
  filename: __filename
}, async (conn, m, text, { reply, isCreator }) => {
  if (!isCreator) return reply('❌ This command is only for the bot creator!');
  const db = loadStickerCommands();

  if (Object.keys(db).length === 0) return reply('❌ No sticker commands are set.');

  let list = '*🎯 Sticker Commands List*\n\n';
  let i = 1;
  for (const key in db) {
    list += `${i}. Command: ${config.PREFIX}${db[key]}\n`;
    i++;
  }

  reply(list);
});

// Supprimer une commande liée à un sticker
cmd({
  pattern: 'delcmd',
  desc: 'Delete a sticker command binding',
  category: 'sticker',
  filename: __filename
}, async (conn, m, text, { reply, isCreator }) => {
  if (!isCreator) return reply('❌ This command is only for the bot creator!');
  if (!m.quoted || m.quoted.mtype !== 'stickerMessage') return reply('❌ Please reply to a sticker');

  const stickerMessage = m.quoted.msg?.contextInfo?.quotedMessage?.stickerMessage;
  if (!stickerMessage) return reply('❌ Could not retrieve the sticker data.');

  let fileSha = null;
  if (stickerMessage.fileSha256) {
    fileSha = Buffer.from(stickerMessage.fileSha256).toString('base64');
  } else if (stickerMessage.mediaKey) {
    fileSha = Buffer.from(stickerMessage.mediaKey).toString('base64');
  }

  if (!fileSha) return reply('❌ Could not get sticker identifier.');

  const db = loadStickerCommands();
  if (!db[fileSha]) return reply('❌ This sticker does not have a command bound to it.');

  const deletedCommand = db[fileSha];
  delete db[fileSha];
  saveStickerCommands(db);

  reply(`✅ Successfully removed command binding: *${config.PREFIX}${deletedCommand}*`);
});
