const { cmd } = require("../command");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const { URL } = require("url");

cmd({
  pattern: "getsource",
  alias: ["web"],
  react: ["🌐"],
  desc: "Get HTML + CSS + JS from a website",
  category: "tools",
  filename: __filename
}, async (conn, m, { args, reply }) => {
  const url = args[0];
  if (!url) {
    return reply("❌ Please provide a website URL.\n\nExample: `.getsource https://example.com`");
  }

  const fullUrl = url.startsWith("http") ? url : "https://" + url;
  if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(fullUrl)) {
    return reply("❌ Invalid URL format.");
  }

  try {
    reply("⏳ Fetching website...");
    const res = await axios.get(fullUrl);
    const html = res.data;
    const tmpDir = path.join(__dirname, "tmp_" + Date.now());
    fs.mkdirSync(tmpDir);
    fs.writeFileSync(path.join(tmpDir, "index.html"), html);

    const $ = cheerio.load(html);
    const base = new URL(fullUrl);
    const assets = [];

    const downloadAsset = async (src, filename) => {
      try {
        const finalUrl = new URL(src, base).href;
        const data = await axios.get(finalUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(path.join(tmpDir, filename), data.data);
      } catch (e) {
        console.warn("❌ Failed to download:", src);
      }
    };

    $('link[rel="stylesheet"]').each((_, el) => {
      const href = $(el).attr("href");
      if (href) assets.push(downloadAsset(href, path.basename(href)));
    });

    $('script[src]').each((_, el) => {
      const src = $(el).attr("src");
      if (src) assets.push(downloadAsset(src, path.basename(src)));
    });

    await Promise.all(assets);

    const zip = new AdmZip();
    zip.addLocalFolder(tmpDir);
    const domain = base.hostname.replace(/^www\./, "").replace(/\W+/g, "_");
    const zipPath = path.join(__dirname, `${domain}.zip`);
    zip.writeZip(zipPath);

    await conn.sendMessage(m.chat, {
      document: fs.readFileSync(zipPath),
      fileName: `${domain}.zip`,
      mimetype: "application/zip",
      caption: `📁 Website Source Code from: ${fullUrl}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ`
    }, { quoted: m });

    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.unlinkSync(zipPath);
  } catch (e) {
    console.error(e);
    reply("❌ Failed to fetch or process the website.");
  }
});
