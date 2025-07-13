const { cmd } = require('../command');
const axios = require('axios');
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = require('baileys');

async function getBuffer(url) {
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(res.data);
}

cmd({
    pattern: "testbuttons",
    alias: ["ibtn", "btnsample"],
    desc: "Send a sample interactive button message with image",
    category: "dev",
    filename: __filename
}, async (conn, m, msg, { reply, from }) => {
    try {
        // Prépare le buffer de l'image
        const buffer = await getBuffer("https://files.catbox.moe/x13xdq.jpg");
        // Prépare le média (image) pour le message
        const media = await prepareWAMessageMedia({ image: buffer }, { upload: conn.waUploadToServer });
        
        // Crée le contenu du message template avec boutons
        const templateMessage = {
            templateMessage: {
                hydratedTemplate: {
                    imageMessage: media.imageMessage,
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

        // Génère le message complet
        const message = generateWAMessageFromContent(from, templateMessage, { quoted: m });

        // Envoie le message
        await conn.relayMessage(from, message.message, { messageId: message.key.id });
    } catch (err) {
        console.error("❌ Button Test Error:", err);
        reply("❌ Failed to send image with buttons.");
    }
});
