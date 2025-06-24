const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');

// 📁 Chemins des fichiers JSON
const antibadPath = path.join(__dirname, '../data/antibad.json');
const warnsPath = path.join(__dirname, '../data/warns.json');

// 🔄 Chargement des fichiers
let antibad = fs.existsSync(antibadPath) ? JSON.parse(fs.readFileSync(antibadPath)) : {};
let warns = fs.existsSync(warnsPath) ? JSON.parse(fs.readFileSync(warnsPath)) : {};

// 💾 Fonctions de sauvegarde
const saveAntibad = () => fs.writeFileSync(antibadPath, JSON.stringify(antibad, null, 2));
const saveWarns = () => fs.writeFileSync(warnsPath, JSON.stringify(warns, null, 2));

// ❌ Liste de mots interdits
const bannedWords = [
  "fuck", "bitch", "nigga", "slut", "dick", "shit", "asshole", "pussy", "motherfucker", "bastard",
  "whore", "faggot", "retard", "cunt", "dumbass", "bullshit", "cock", "suck my", "kill yourself",
  "putain", "salope", "enculé", "connard", "bordel", "merde", "bite", "nique", "tapette",
  "ta gueule", "fils de pute", "encule", "fdp", "ntm", "tg", "pd", "chiant", "débile", "dégage",
  "branleur", "gros con", "grosse pute", "trou du cul", "ferme ta gueule", "enfoiré",
  "puta", "mierda", "coño", "cabron", "pendejo", "maricon", "gilipollas", "chinga", "puto", "culero",
  "kos", "sharmouta", "zebi", "nik", "3ayra", "ya kalb", "ibn kalb", "kos omak", "shlonak",
  "manmanw", "malpwòp", "koko", "koudjay", "salòp", "bouzen", "pitit bouzen", "fanm sal", "kaka", "gason sal",
  "fck", "sht", "btch", "n1gga", "nig", "mf", "b1tch", "dik", "sux", "fu"
];

// ✅ Commande d'activation/désactivation
cmd({
  pattern: "antibad",
  alias: ["badfilter"],
  desc: "Enable or disable anti-badword filter (admin only).",
  category: "settings",
  react: "🚫",
  filename: __filename
}, async (conn, m, msg, { text, isGroup }) => {
  if (!isGroup) return m.reply("❌ This command only works in groups.");

  const metadata = await conn.groupMetadata(m.chat);
  const isAdmin = metadata.participants.find(p => p.id === m.sender)?.admin;
  if (!isAdmin) return m.reply("⛔ Only group admins can use this command.");

  if (!text) return m.reply("Usage: .antibad on | off");

  const groupId = m.chat;
  if (text.toLowerCase() === "on") {
    antibad[groupId] = true;
    saveAntibad();
    return m.reply("✅ AntiBad enabled in this group.");
  } else if (text.toLowerCase() === "off") {
    antibad[groupId] = false;
    saveAntibad();
    return m.reply("❌ AntiBad disabled in this group.");
  } else {
    return m.reply("Usage: .antibad on | off");
  }
});

// 📥 Gestion des messages entrants
module.exports = (conn) => {
  conn.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe || m.key.remoteJid === 'status@broadcast') return;

    const from = m.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    if (!isGroup || !antibad[from]) return;

    const sender = m.key.participant || m.key.remoteJid;

    let body =
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      m.message?.imageMessage?.caption ||
      m.message?.videoMessage?.caption ||
      "";

    const lower = body.toLowerCase();
    const matched = bannedWords.find(word => lower.includes(word));
    if (!matched) return;

    const metadata = await conn.groupMetadata(from);
    const participants = metadata.participants;

    const isAdmin = participants.find(p => p.id === sender)?.admin;
    const botJid = conn.user.id.split(":")[0] + "@s.whatsapp.net";
    const isBotAdmin = participants.find(p => p.id === botJid)?.admin;

    if (!isBotAdmin || isAdmin) return;

    // 🔥 Supprimer le message
    await conn.sendMessage(from, { delete: m.key });

    // ⚠️ Incrémenter les avertissements
    warns[from] = warns[from] || {};
    warns[from][sender] = warns[from][sender] ? warns[from][sender] + 1 : 1;
    saveWarns();

    const count = warns[from][sender];

    // ⚠️ Envoyer un avertissement
    await conn.sendMessage(from, {
      text: `🚫 @${sender.split("@")[0]}, bad word detected!\n❗ Warning ${count}/3`,
      mentions: [sender]
    });

    // ⛔ Kick à 3 avertissements
    if (count >= 3) {
      await conn.groupParticipantsUpdate(from, [sender], "remove");
      delete warns[from][sender];
      saveWarns();
    }
  });
};