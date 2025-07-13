const { default: axios } = require('axios');
const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, prepareWAMessageMedia } = require('baileys');
const { cmd } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;

cmd({
    pattern: "btn",
    react: "🦄",
    desc: "Test interactive button",
    category: "download",
    filename: __filename
}, async (conn, m, msgData) => {
    const { from, reply } = msgData;

    try {
        const pan = `> POWERED BY DYBY TECH OFC 🧑‍💻`;

        // Préparation de l'image
        const mediaMsg = await prepareWAMessageMedia(
            { image: { url: 'https://files.catbox.moe/x13xdq.jpg' } },
            { upload: conn.waUploadToServer }
        );

        const msg = generateWAMessageFromContent(from, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: pan },
                        carouselMessage: {
                            cards: [
                                {
                                    header: proto.Message.InteractiveMessage.Header.create({
                                        title: ``,
                                        gifPlayback: true,
                                        subtitle: 'DYBY TECH OFC',
                                        hasMediaAttachment: false,
                                        ...mediaMsg.imageMessage
                                    }),
                                    body: {
                                        text: `MEGALODON-MD BUTTON TEST`
                                    },
                                    nativeFlowMessage: {
                                        buttons: [
                                            {
                                                name: "quick_reply",
                                                buttonParamsJson: JSON.stringify({
                                                    display_text: "Menu",
                                                    id: `${prefix}menu`
                                                })
                                            },
                                            {
                                                name: "quick_reply",
                                                buttonParamsJson: JSON.stringify({
                                                    display_text: "Alive",
                                                    id: `${prefix}alive`
                                                })
                                            },
                                            {
                                                name: "cta_url",
                                                buttonParamsJson: JSON.stringify({
                                                    display_text: "WhatsApp Channel",
                                                    url: "https://whatsapp.com/channel/0029VbAdcIXJP216dKW1253g"
                                                })
                                            },
                                            {
                                                name: "cta_url",
                                                buttonParamsJson: JSON.stringify({
                                                    display_text: "GitHub Repo",
                                                    url: "https://github.com/DybyTech/MEGALODON-MD",
                                                    merchant_url: "https://github.com/DybyTech/MEGALODON-MD"
                                                })
                                            }
                                        ]
                                    }
                                }
                            ],
                            messageVersion: 1
                        }
                    }
                }
            }
        }, {});

        await conn.relayMessage(from, msg.message, { messageId: msg.key.id });

    } catch (e) {
        console.error(e);
        reply(`❌ Error: ${e.message}`);
    }
});
