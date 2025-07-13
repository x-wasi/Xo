const axios = require('axios');
const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, downloadContentFromMessage, areJidsSameUser, getContentType } = require('baileys')
const {cmd , commands} = require('../command')
const prefix = config.PREFIX;


cmd({
    pattern: "button",
    react: "🦄",
    desc: "downlod song",
    category: "other",
    filename: __filename
},
async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

let pan = `> POWERED BY DYBY TECH OFC 🧑‍💻`;
const url = "https://files.catbox.moe/x13xdq.jpg"
async function image(url) {
  const { imageMessage } = await generateWAMessageContent({
    image: {
      url
    }
  }, {
    upload: conn.waUploadToServer
  });
  return imageMessage;
}
let msg = generateWAMessageFromContent(
  m.chat,
  {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          body: {
            text: pan
          },
          carouselMessage: {
            cards: [
              {
                header: proto.Message.InteractiveMessage.Header.create({
          ...(await prepareWAMessageMedia({ image: { url: 'https://files.catbox.moe/x13xdq.jpg' } }, { upload: conn.waUploadToServer })),
          title: ``,
          gifPlayback: true,
          subtitle: 'DYBY TECH OFC',
          hasMediaAttachment: false
        }),
                body: {
                  text: `MEGALODON-MD BUTTON TEST`
                },
                nativeFlowMessage: {
                  buttons: [
                    {
      name: "quick_reply",
      buttonParamsJson: `{"display_text":"Menu",
      "id": "${prefix}menu"}`
             },
                    {
     name: "quick_reply",
     buttonParamsJson: `{"display_text":"Alive",
     "id": "${prefix}alive"}`
             },
             {
                      name: "cta_url",
                      buttonParamsJson: `{"display_text":" WhatsApp Channel ","url":"https://whatsapp.com/channel/0029VbAdcIXJP216dKW1253g"}`
                    },
                    {
                      name: "cta_url",
                      buttonParamsJson: `{"display_text":" Gitbub Repo ","url":"https://github.com/DybyTech/MEGALODON-MD","merchant_url":"https://github.com/DybyTech/MEGALODON-MD"}`
                    },
                  ],
                },
              },
            ],
            messageVersion: 1,
          },
        },
      },
    },
  },
  {}
);

await conn.relayMessage(msg.key.remoteJid, msg.message, {
  messageId: msg.key.id,
});

}catch(e){
console.log(e)
reply(`${e}`)
}
})
