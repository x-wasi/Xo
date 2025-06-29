const axios = require("axios");
const { cmd } = require("../command");

// Facebook Downloader v1 (basic)
cmd({
  pattern: "fb2",
  alias: ["facebook2", "fbvideo2"],
  react: '📥',
  desc: "Download videos from Facebook (Basic API)",
  category: "download",
  use: ".fb <ғᴀᴄᴇʙᴏᴏᴋ ᴠɪᴅᴇᴏ ᴜʀʟ>",
  filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
  try {
    const fbUrl = args[0];
    if (!fbUrl || !fbUrl.includes("facebook.com")) {
      return reply('Please ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ғᴀᴄᴇʙᴏᴏᴋ ᴠɪᴅᴇᴏ ᴜʀʟ. ᴇxᴀᴍᴘʟᴇ: `.ғʙ https://facebook.com/...`');
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    const apiUrl = `https://apis.davidcyriltech.my.id/facebook?url=${encodeURIComponent(fbUrl)}`;
    const response = await axios.get(apiUrl);

    if (!response.data || !response.data.status || !response.data.result || !response.data.result.downloads) {
      return reply('❌ Unable to fetch the video. Please check the URL and try again.');
    }

    const { title, downloads } = response.data.result;
    const downloadLink = downloads.hd?.url || downloads.sd.url;
    const quality = downloads.hd ? "HD" : "SD";

    await reply('ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ᴠɪᴅᴇᴏ... ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ.📥');

    await conn.sendMessage(from, {
      video: { url: downloadLink },
      caption: `> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ`
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error('Error:', error);
    reply('❌ Unable to download the video. Please try again later.');
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});

// Facebook Downloader v2
cmd({
  pattern: "fb",
  alias: ["facebook", "fbdl"],
  react: '📥',
  desc: "Download videos from Facebook (API v2)",
  category: "download",
  use: ".fb2 <Facebook video URL>",
  filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
  try {
    const fbUrl = args[0];
    if (!fbUrl || !fbUrl.includes("facebook.com")) {
      return reply('ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ғᴀᴄᴇʙᴏᴏᴋ ᴠɪᴅᴇᴏ ᴜʀʟ. ᴇxᴀᴍᴘʟᴇ: `.ғʙ2 https://facebook.com/...`');
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    const apiUrl = `https://apis.davidcyriltech.my.id/facebook2?url=${encodeURIComponent(fbUrl)}`;
    const response = await axios.get(apiUrl);

    if (!response.data || !response.data.status || !response.data.video) {
      return reply('❌ Unable to fetch the video. Please check the URL and try again.');
    }

    const { title, downloads } = response.data.video;
    const downloadLink = downloads.find(d => d.quality === "HD")?.downloadUrl || downloads[0].downloadUrl;

    await reply('ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ᴠɪᴅᴇᴏ... ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ.📥');

    await conn.sendMessage(from, {
      video: { url: downloadLink },
      caption: `> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ`
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error('Error:', error);
    reply('❌ Unable to download the video. Please try again later.');
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});

// Facebook Downloader v3
cmd({
  pattern: "fb3",
  alias: ["facebook3"],
  react: '📥',
  desc: "Download videos from Facebook (API v3)",
  category: "download",
  use: ".fb3 <ғᴀᴄᴇʙᴏᴏᴋ ᴠɪᴅᴇᴏ ᴜʀʟ>",
  filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
  try {
    const fbUrl = args[0];
    if (!fbUrl || !fbUrl.includes("facebook.com")) {
      return reply('Please ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ғᴀᴄᴇʙᴏᴏᴋ ᴠɪᴅᴇᴏ ᴜʀʟ. ᴇxᴀᴍᴘʟᴇ: `.ғʙ3 https://facebook.com/...`');
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    const apiUrl = `https://apis.davidcyriltech.my.id/facebook3?url=${encodeURIComponent(fbUrl)}`;
    const response = await axios.get(apiUrl);

    if (!response.data || !response.data.status || !response.data.results || !response.data.results.download) {
      return reply('❌ Unable to fetch the video. Please check the URL and try again.');
    }

    const { title, download } = response.data.results;
    const downloadLink = download.hdVideos?.videoUrl || download.sdVideos.videoUrl;
    const quality = download.hdVideos ? "HD" : "SD";

    await reply('ᴅᴏᴡɴʟᴏᴀᴅɪɴғ ᴠɪᴅᴇᴏ... ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ.📥');

    await conn.sendMessage(from, {
      video: { url: downloadLink },
      caption: `> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ`
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error('Error:', error);
    reply('❌ Unable to download the video. Please try again later.');
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});
