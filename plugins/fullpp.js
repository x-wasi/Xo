const { cmd } = require("../command");
const Jimp = require("jimp");

cmd({
  pattern: "fullpp",
  alias: ["setpp", "setdp", "pp"],
  react: "🖼️",
  desc: "Set full image as bot's profile picture",
  category: "tools",
  filename: __filename
}, async (client, message, match, { from, isCreator }) => {
  try {
    // Get bot's JID (two possible methods)
    const botJid = client.user?.id || (client.user.id.split(":")[0] + "@s.whatsapp.net");
    
    // Allow both bot owner and bot itself to use the command
    if (message.sender !== botJid && !isCreator) {
      return await client.sendMessage(from, {
        text: "*📛 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴛʜᴇ ʙᴏᴛ ᴏʀ*"
      }, { quoted: message });
    }

    if (!message.quoted || !message.quoted.mtype || !message.quoted.mtype.includes("image")) {
      return await client.sendMessage(from, {
        text: "*⚠️ ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀɴ ɪᴍᴀɢᴇ ᴛᴏ sᴇᴛ ᴀs ᴘʀᴏғɪʟᴇ ᴘɪᴄᴛᴜʀᴇ*"
      }, { quoted: message });
    }

    await client.sendMessage(from, {
      text: "*⏳ ᴘʀᴏᴄᴇssɪɴɢ ɪᴍᴀɢᴇ, ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ...*"
    }, { quoted: message });

    const imageBuffer = await message.quoted.download();
    const image = await Jimp.read(imageBuffer);

    // Image processing pipeline
    const blurredBg = image.clone().cover(640, 640).blur(10);
    const centeredImage = image.clone().contain(640, 640);
    blurredBg.composite(centeredImage, 0, 0);
    const finalImage = await blurredBg.getBufferAsync(Jimp.MIME_JPEG);

    // Update profile picture
    await client.updateProfilePicture(botJid, finalImage);

    await client.sendMessage(from, {
      text: "> *✅ ʙᴏᴛ's ᴘʀᴏғɪʟᴇ ᴘɪᴄᴛᴜʀᴇ ᴜᴘᴅᴀᴛᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ!*"
    }, { quoted: message });

  } catch (error) {
    console.error("fullpp Error:", error);
    await client.sendMessage(from, {
      text: `*❌ Error updating profile picture:*\n${error.message}`
    }, { quoted: message });
  }
});
