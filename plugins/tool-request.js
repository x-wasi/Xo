const { cmd } = require("../command");
const config = require("../config");
const fs = require("fs");
const path = require("path");

const reportFile = path.join(__dirname, "../data/reports.json");

cmd({
    pattern: "report",
    alias: ["ask", "bug", "request"],
    desc: "Report a bug or request a feature",
    category: "utility",
    react: ["👨‍💻"],
    filename: __filename
}, async (conn, m, msg, { args, reply }) => {
    try {
        if (!args.length) {
            return reply(`❌ 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: ${config.PREFIX}𝐫𝐞𝐩𝐨𝐫𝐭 𝐏𝐥𝐚𝐲 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐧𝐨𝐭 𝐰𝐨𝐫𝐤𝐢𝐧𝐠`);
        }

        const devNumbers = ["50934960331", "50948336180", "50948702213"];
        const messageId = m.key?.id;
        const sender = m.sender;
        const time = new Date().toLocaleString("en-US", { timeZone: "UTC" });

        // Empêche le double envoi
        global.reportedMessages = global.reportedMessages || {};
        if (global.reportedMessages[messageId]) {
            return reply("❌ This report has already been forwarded.");
        }
        global.reportedMessages[messageId] = true;

        const reportText = `*| 𝐑𝐄𝐐𝐔𝐄𝐒𝐓 / 𝐁𝐔𝐆 𝐑𝐄𝐏𝐎𝐑𝐓 |*\n\n*User*: @${sender.split("@")[0]}\n*Time:* ${time}\n*𝐌𝐞𝐬𝐬𝐚𝐠𝐞:* ${args.join(" ")}`;
        const confirmation = `✅ Thanks ${msg.pushName || "user"}, 𝐲𝐨𝐮𝐫 𝐫𝐞𝐩𝐨𝐫𝐭 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐬𝐞𝐧𝐭 𝐭𝐨 𝐭𝐡𝐞 𝐝𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫𝐬.`;

        // Sauvegarde dans le fichier
        const reports = fs.existsSync(reportFile) ? JSON.parse(fs.readFileSync(reportFile)) : [];
        reports.push({
            user: sender.split("@")[0],
            message: args.join(" "),
            time
        });
        fs.writeFileSync(reportFile, JSON.stringify(reports, null, 2));

        // Envoie aux développeurs
        for (const number of devNumbers) {
            await conn.sendMessage(`${number}@s.whatsapp.net`, {
                text: reportText,
                mentions: [sender]
            });
        }

        reply(confirmation);
    } catch (error) {
        console.error("Report Error:", error);
        reply("❌ Failed to send your report.");
    }
});

//reportlist

cmd({
    pattern: "reportlist",
    desc: "Show all bug reports/requests",
    category: "utility",
    filename: __filename
}, async (conn, m, _m, { reply }) => {
    try {
        const filePath = "./data/reports.json";

        if (!fs.existsSync(filePath)) return reply("No reports found.");
        const data = JSON.parse(fs.readFileSync(filePath));

        if (!data.length) return reply("Report list is empty.");

        let text = "*📋 𝐑𝐞𝐩𝐨𝐫𝐭 𝐋𝐢𝐬𝐭:*\n\n";
        data.forEach((item, i) => {
            text += `*${i + 1}. 𝐅𝐫𝐨𝐦:* @${item.user}\n*𝐌𝐞𝐬𝐬𝐚𝐠𝐞:* ${item.message}\n*𝐃𝐚𝐭𝐞:* ${new Date(item.timestamp).toLocaleString()}\n\n`;
        });

        await conn.sendMessage(m.chat, { text, mentions: data.map(x => x.user + "@s.whatsapp.net") }, { quoted: m });
    } catch (err) {
        console.error(err);
        reply("❌ Error reading the report list.");
    }
});
