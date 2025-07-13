const { cmd } = require('../command');

cmd({
    pattern: "testbuttons",
    alias: ["ibtn", "btnsample"],
    desc: "Send a sample interactive button message",
    react: "🎴",
    category: "other",
    filename: __filename
}, async (conn, m, msg, { reply, from }) => {
    try {
        const interactiveButtons = [
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "Quick Reply",
                    id: "quick_reply_id"
                })
            },
            {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                    display_text: "Tap Here!",
                    url: "https://www.example.com/"
                })
            },
            {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                    display_text: "Copy Code",
                    id: "copy_code_id",
                    copy_code: "12345"
                })
            }
        ];

        const interactiveMessage = {
            text: "👋 *Hello World!*",
            title: "🌟 This is the Title",
            footer: "📌 This is the Footer",
            interactiveButtons
        };

        await conn.sendMessage(from, interactiveMessage, { quoted: m });
    } catch (err) {
        console.error("Button Test Error:", err);
        reply("❌ Failed to send interactive buttons.");
    }
});
