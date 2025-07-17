const config = require("../config");
const prefix = config.PREFIX;
const os = require("os");
const moment = require("moment");
const { cmd } = require("../command");
const { runtime } = require("../lib/functions");

cmd({
  pattern: "alive",
  alias: ["test"],
  desc: "Show styled alive menu",
  category: "main",
  use: ".alive",
  react: "👋",
  filename: __filename
}, async (conn, mek, m, { from, pushname, reply }) => {
  try {
    const uptime = runtime(process.uptime());
    const usedRam = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const totalRam = (os.totalmem() / 1024 / 1024).toFixed(2);

    const caption = `
┌───⭓ ʜɪ *${pushname}* 🖐
│
│ ⏳ ᴜᴘᴛɪᴍᴇ: ${uptime}
│ 🤖 ʙᴏᴛ ɴᴀᴍᴇ: ${config.BOT_NAME}
│ 🧑‍💻 ᴏᴡɴᴇʀ: ${config.OWNER_NAME}
│ 
│ 📢 ᴊᴏɪɴ ᴏᴜʀ ᴄʜᴀɴɴᴇʟ:
│ https://whatsapp.com/channel/0029VbAdcIXJP216dKW1253g
└────────────⭓
    `.trim();

    const buttons = [
      {
        buttonId: "action",
        buttonText: { displayText: "📂 ᴍᴇɴᴜ ᴏᴘᴛɪᴏɴꜱ" },
        type: 4,
        nativeFlowInfo: {
          name: "single_select",
          paramsJson: JSON.stringify({
            title: "📂 ᴄʟɪᴄᴋ ʜᴇʀᴇ",
            sections: [
              {
                title: "📁 ᴍᴇɢᴀʟᴏᴅᴏɴ-ᴍᴅ",
                highlight_label: "",
                rows: [
                  {
                    title: "📂 ᴍᴇɴᴜ",
                    description: "ᴏᴘᴇɴ ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅꜱ",
                    id: `${prefix}menu`,
                  },
                  {
                    title: "👑 ᴏᴡɴᴇʀ",
                    description: "ᴄᴏɴᴛᴀᴄᴛ ʙᴏᴛ ᴏᴡɴᴇʀ",
                    id: `${prefix}owner`,
                  },
                  {
                    title: "📶 ᴘɪɴɢ",
                    description: "ᴛᴇꜱᴛ ʙᴏᴛ ꜱᴘᴇᴇᴅ",
                    id: `${prefix}ping`,
                  },
                  {
                    title: "🖥️ ꜱʏꜱᴛᴇᴍ",
                    description: "ꜱʏꜱᴛᴇᴍ ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ",
                    id: `${prefix}system`,
                  },
                  {
                    title: "🛠️ ʀᴇᴘᴏ",
                    description: "ɢɪᴛʜᴜʙ ʀᴇᴘᴏꜱɪᴛᴏʀʏ",
                    id: `${prefix}repo`,
                  },
                ],
              },
            ],
          }),
        },
      },
    ];

    await conn.sendMessage(from, {
      buttons,
      headerType: 1,
      viewOnce: true,
      image: { url: config.MENU_IMAGE_URL },
      caption,
    }, { quoted: mek });

  } catch (err) {
    console.error(err);
    await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
    reply("❌ An error occurred while processing your request.");
  }
});
