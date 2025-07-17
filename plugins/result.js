const axios = require("axios");
const { cmd } = require("../command");

// Command: result
cmd({
    pattern: "result",
    desc: "Fetch FBISE SSC-II result by Roll Number.",
    category: "education",
    react: "📄",
    filename: __filename
}, async (conn, mek, m, { args, reply }) => {
    try {
        // Check if roll number is provided
        if (args.length === 0) {
            return reply(`⚠️ *Please provide a roll number.*\n\n📝 *Example:*\n.result 1234567`);
        }

        const roll = args[0];

        // Validate roll number format
        if (!/^\d{7}$/.test(roll)) {
            return reply("❌ *Invalid roll number.* Please enter a 7-digit number.");
        }

        // API URL
        const apiUrl = `https://fbise-apii-e12b4fd66017.herokuapp.com/api/result?roll=${roll}`;
        const response = await axios.get(apiUrl);

        if (response.status === 200 && response.data.status === "success") {
            const student = response.data.data;

            // Format the result with emojis
            const message = `
📌 *FBISE SSC-II Result 2025*
━━━━━━━━━━━━━━
🎫 *Roll No:* ${student.RollNo}
👤 *Name:* ${student.Name}
🏫 *School:* ${student.SchoolName}
✅ *Status:* ${student.Status}
📊 *Marks:* ${student.Marks || "—"}
🎖 *Grade:* ${student.Grade || "—"}
━━━━━━━━━━━━━━
🔗 Powered by FBISE Gazette API
Developed by Mr Wasi ✅
            `;

            reply(message.trim());
        } else {
            reply("❌ *Roll number not found.* Please check and try again.");
        }
    } catch (error) {
        console.error(error);
        reply("⚠️ *An error occurred while fetching the result.* Please try again.");
    }
});
