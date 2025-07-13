const { cmd } = require('../command');
const { generateWAMessageFromContent, proto } = require('baileys');

cmd({
    pattern: "btn",
    alias: ["ibtn", "btnsample"],
    desc: "Send a sample interactive button message without image",
    react: "🎴",
    category: "dev",
    filename: __filename
}, async (conn, m, msg, { reply, from }) => {
    try {
        const templateMessage = {
            templateMessage: {
                hydratedTemplate: {
                    hydratedContentText: "👋 *Hello World!*\nChoose an option below.",
                    hydratedFooterText: "📌 This is the Footer",
                    hydratedButtons: [
                        {
                            quickReplyButton: {
                                displayText: "💬 Quick Reply",
                                id: "quick_reply_id"
                            }
                        },
                        {
                            urlButton: {
                                displayText: "🌐 Tap Here!",
                                url: "https://www.example.com/"
                            }
                        },
                        {
                            quickReplyButton: {
                                displayText: "📋 Copy Code",
                                id: "copy_code_id"
                            }
                        }
                    ]
                }
            }
        };

        const message = generateWAMessageFromContent(from, templateMessage, { quoted: m });

        await conn.relayMessage(from, message.message, { messageId: message.key.id });
    } catch (err) {
        console.error("❌ Button Test Error:", err);
        reply("❌ Failed to send buttons.");
    }
});
