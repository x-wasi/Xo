// coded by mr wasi dev for daby tech enjoy dont forget to give credit 

const os = require('os');
const moment = require('moment-timezone');
const { cmd } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;

cmd({
  pattern: "test",
  alias: ["alive"],
  desc: "Check if bot is online and show system info with interactive buttons.",
  category: "main",
  react: "👋",
  filename: __filename
}, async (
  conn, mek, m, {
    from, pushname, reply
  }
) => {
  try {
    const botname = "𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃";
    const ownername = "ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ";
    const channelJid = '120363401051937059@newsletter';
    const botVersion = "MD";
    const runtime = (seconds) => {
      const pad = (s) => (s < 10 ? '0' : '') + s;
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    };

    const uptime = runtime(process.uptime());
    const date = moment().tz("America/Port-au-Prince").format("dddd, MMMM Do YYYY");
    const time = moment().tz("America/Port-au-Prince").format("hh:mm:ss A");

    const fakeQuoted = {
      key: {
        remoteJid: 'status@broadcast',
        participant: '0@s.whatsapp.net'
      },
      message: {
        newsletterAdminInviteMessage: {
          newsletterJid: channelJid,
          newsletterName: botname,
          caption: ownername,
          inviteExpiration: 0
        }
      }
    };

    const message = `
> ╭─────────────◆
> │  *👋 ʜᴇʟʟᴏ ${pushname}*
> │
> │  ✅ *ʙᴏᴛ sᴛᴀᴛᴜs:* _ᴏɴʟɪɴᴇ_
> │  🔧 *ʙᴏᴛ ɴᴀᴍᴇ:* ${botname}
> │  👑 *ᴏᴡɴᴇʀ:* ${config.OWNER_NAME}
> │  🧠 *ᴠᴇʀsɪᴏɴ:* ${botVersion}
> │  ⏱ *ᴜᴘᴛɪᴍᴇ:* ${uptime}
> │  📅 *ᴅᴀᴛᴇ:* ${date}
> │  🕐 *ᴛɪᴍᴇ:* ${time}
> │  🖥 *ᴘʟᴀᴛғᴏʀᴍ:* ${os.platform()}
> ╰─────────────◆`;

    // Define button sections
    const sections = [
      {
        title: "📌 Bot Status Options",
        rows: [
          {
            title: "🔄 Refresh Status",
            rowId: `${prefix}Alive`
          },
          {
            title: "📋 Main Menu",
            rowId: `${prefix}Menu`
          }
        ]
      },
      {
        title: "🔧 System Info",
        rows: [
          {
            title: "📊 Detailed Stats",
            rowId: "statistics"
          },
          {
            title: "⚙️ Settings",
            rowId: `${prefix}Env`
          }
        ]
      }
    ];

    const listMessage = {
      text: message.trim(),
      footer: "📍 Select an option below",
      title: "✨ Megalodon-MD Status",
      buttonText: "📋 Open Menu",
      sections
    };

    // Send image with caption and buttons
    await conn.sendMessage(from, {
      image: { url: config.MENU_IMAGE_URL },
      caption: message.trim(),
      footer: "📍 Select an option below",
      title: "✨ Megalodon-MD Status",
      buttonText: "📋 Open Menu",
      sections
    }, { quoted: fakeQuoted });

  } catch (e) {
    console.error("Alive Command Error:", e);
    reply(`❌ Error:\n${e.message}`);
  }
});
