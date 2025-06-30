const { cmd } = require("../command");

cmd({
  pattern: "post",
  alias: ["poststatus", "story", "meqdia"],
  react: '📝',
  desc: "Posts replied media to bot's status",
  category: "utility",
  filename: __filename
}, async (client, message, match, extras) => {
  try {
    const quotedMsg = message.quoted ? message.quoted : message;
    const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';

    if (!mimeType) {
      return await client.sendMessage(message.chat, {
        text: "*ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀɴ ɪᴍᴀɢᴇ, ᴠɪᴅᴇᴏ, ᴏʀ ᴀᴜᴅɪᴏ ғɪʟᴇ.*"
      }, { quoted: message });
    }

    const buffer = await quotedMsg.download();
    const mtype = quotedMsg.mtype;
    const caption = quotedMsg.text || '';

    let statusContent = {};

    switch (mtype) {
      case "imageMessage":
        statusContent = {
          image: buffer,
          caption: caption
        };
        break;
      case "videoMessage":
        statusContent = {
          video: buffer,
          caption: caption
        };
        break;
      case "audioMessage":
        statusContent = {
          audio: buffer,
          mimetype: "audio/mp4",
          ptt: quotedMsg.ptt || false
        };
        break;
      default:
        return await client.sendMessage(message.chat, {
          text: "ᴏɴʟʏ ɪᴍᴀɢᴇ, ᴠɪᴅᴇᴏ, ᴀɴᴅ ᴀᴜᴅɪᴏ ғɪʟᴇs ᴄᴀɴ ʙᴇ ᴘᴏsᴛᴇᴅ ᴛᴏ sᴛᴀᴛᴜs."
        }, { quoted: message });
    }

    await client.sendMessage("status@broadcast", statusContent);

    await client.sendMessage(message.chat, {
      text: "✅ ᴍᴇᴅɪᴀ ᴘᴏsᴛᴇᴅ ᴛᴏ ᴍʏ sᴛᴀᴛᴜs sᴜᴄᴄᴇssғᴜʟʟʏ."
    }, { quoted: message });

  } catch (error) {
    console.error("Status Error:", error);
    await client.sendMessage(message.chat, {
      text: "❌ Failed to post status:\n" + error.message
    }, { quoted: message });
  }
});
