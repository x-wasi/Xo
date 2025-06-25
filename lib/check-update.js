const axios = require('axios');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');

cmd({
    pattern: "checkupdate",
    alias: ["changelog", "cupdate", "updateinfo"],
    react: "🚀",
    desc: "Check bot version, system stats, and update info.",
    category: "info",
    filename: __filename,
}, async (conn, m, mdata, { from, sender, pushname, reply }) => {
    try {
        // 📁 Lecture de la version locale
        const localPath = path.join(__dirname, '../data/version.json');
        let currentVersion = "Unknown";
        let currentChangelog = "No changelog available.";

        if (fs.existsSync(localPath)) {
            const localData = JSON.parse(fs.readFileSync(localPath));
            currentVersion = localData.version || currentVersion;
            currentChangelog = localData.changelog || currentChangelog;
        }

        // 🌐 Récupération de la version GitHub
        const githubUrl = 'https://raw.githubusercontent.com/DybyTech/MEGALODON-MD/main/data/version.json';
        let latestVersion = "Unknown";
        let latestChangelog = "No changelog available.";

        try {
            const { data: remoteData } = await axios.get(githubUrl);
            latestVersion = remoteData.version || latestVersion;
            latestChangelog = remoteData.changelog || latestChangelog;
        } catch (err) {
            console.error("❌ Failed to fetch latest version:", err);
        }

        // 🧠 Statistiques système et bot
        const pluginsPath = path.join(__dirname, '../plugins');
        const pluginCount = fs.readdirSync(pluginsPath).filter(f => f.endsWith('.js')).length;
        const commandCount = commands.length;
        const uptime = runtime(process.uptime());
        const usedRAM = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalRAM = (os.totalmem() / 1024 / 1024).toFixed(2);
        const hostname = os.hostname();
        const lastUpdate = fs.statSync(localPath).mtime.toLocaleString();
        const repoURL = 'https://github.com/DybyTech/MEGALODON-MD';

        // 🔄 Statut de mise à jour
        let updateNote = '✅ Your MEGALODON-MD bot is up-to-date!';
        if (currentVersion !== latestVersion) {
            updateNote =
                `🚀 Your MEGALODON-MD bot is *outdated!*\n\n` +
                `🔹 *Current Version:* ${currentVersion}\n` +
                `🔹 *Latest Version:* ${latestVersion}\n\n` +
                `Use *.update* to update.`;
        }

        const greeting = new Date().getHours() < 12 ? "🌞 Good Morning" : "🌙 Good Night";

        // ✉️ Construction du message
        const caption =
            `${greeting}, ${pushname}!\n\n` +
            `📌 *Bot Name:* MEGALODON-MD\n` +
            `🔖 *Current Version:* ${currentVersion}\n` +
            `📢 *Latest Version:* ${latestVersion}\n` +
            `📂 *Total Plugins:* ${pluginCount}\n` +
            `🧩 *Total Commands:* ${commandCount}\n\n` +
            `💾 *System Info:*\n` +
            `⏳ *Uptime:* ${uptime}\n` +
            `📟 *RAM Usage:* ${usedRAM} MB / ${totalRAM} MB\n` +
            `🖥️ *Host Name:* ${hostname}\n` +
            `📅 *Last Update:* ${lastUpdate}\n\n` +
            `📝 *Changelog:*\n${latestChangelog}\n\n` +
            `⭐ *GitHub Repo:* ${repoURL}\n\n` +
            `${updateNote}`;

        // 📤 Envoi du message avec image
        await conn.sendMessage(from, {
            image: { url: 'https://files.catbox.moe/frns4k.jpg' },
            caption,
            contextInfo: {
                mentionedJid: [mdata.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401051937059@newsletter',
                    newsletterName: '𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃',
                    serverMessageId: 143
                }
            }
        }, { quoted: m });

    } catch (err) {
        console.error("❌ An error occurred in .checkupdate:", err);
        reply("❌ An error occurred while checking the bot version.");
    }
});
