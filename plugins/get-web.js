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
  desc: "Get HTML + CSS + JS + assets from a website",
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

    // Création dossier temporaire
    const tmpDir = path.join(__dirname, "tmp_" + Date.now());
    fs.mkdirSync(tmpDir);

    // Sauvegarde HTML
    fs.writeFileSync(path.join(tmpDir, "index.html"), html);

    const $ = cheerio.load(html);
    const base = new URL(fullUrl);
    const assets = [];

    const downloadAsset = async (src, filepath) => {
      try {
        const finalUrl = new URL(src, base).href;
        const data = await axios.get(finalUrl, { responseType: "arraybuffer" });
        const fullpath = path.join(tmpDir, filepath);
        fs.mkdirSync(path.dirname(fullpath), { recursive: true });
        fs.writeFileSync(fullpath, data.data);
        // console.log("✅ Downloaded:", finalUrl);
      } catch (e) {
        console.warn("❌ Failed to download:", src);
      }
    };

    // CSS
    $('link[rel="stylesheet"]').each((_, el) => {
      const href = $(el).attr("href");
      if (href) {
        const filename = path.basename(href.split("?")[0]);
        assets.push(downloadAsset(href, path.join("css", filename)));
      }
    });

    // JS
    $('script[src]').each((_, el) => {
      const src = $(el).attr("src");
      if (src) {
        const filename = path.basename(src.split("?")[0]);
        assets.push(downloadAsset(src, path.join("js", filename)));
      }
    });

    // Images
    $('img[src]').each((_, el) => {
      const src = $(el).attr("src");
      if (src) {
        const filename = path.basename(src.split("?")[0]);
        assets.push(downloadAsset(src, path.join("images", filename)));
      }
    });

    // Videos
    $('video[src]').each((_, el) => {
      const src = $(el).attr("src");
      if (src) {
        const filename = path.basename(src.split("?")[0]);
        assets.push(downloadAsset(src, path.join("videos", filename)));
      }
    });

    // Audio
    $('audio[src]').each((_, el) => {
      const src = $(el).attr("src");
      if (src) {
        const filename = path.basename(src.split("?")[0]);
        assets.push(downloadAsset(src, path.join("audio", filename)));
      }
    });

    // Sources (audio/video)
    $('source[src]').each((_, el) => {
      const src = $(el).attr("src");
      if (src) {
        const filename = path.basename(src.split("?")[0]);
        assets.push(downloadAsset(src, path.join("media", filename)));
      }
    });

    await Promise.all(assets);

    // Parse CSS pour récupérer url(...) dedans (ex: fonts, images)
    const cssDir = path.join(tmpDir, "css");
    if (fs.existsSync(cssDir)) {
      const cssFiles = fs.readdirSync(cssDir);
      for (const file of cssFiles) {
        const cssPath = path.join(cssDir, file);
        let content = fs.readFileSync(cssPath, "utf8");
        const urlRegex = /url["']?([^"')]+)["']?/g;
        let match;
        while ((match = urlRegex.exec(content)) !== null) {
          const assetUrl = match[1];
          if (!assetUrl.startsWith("data:")) {
            const filename = path.basename(assetUrl.split("?")[0]);
            await downloadAsset(assetUrl, path.join("css", "assets", filename));
          }
        }
      }
    }

    // Créer zip
    const zip = new AdmZip();
    zip.addLocalFolder(tmpDir);
    const domain = base.hostname.replace(/^www\./, "").replace(/\W+/g, "_");
    const zipPath = path.join(__dirname, `${domain}.zip`);
    zip.writeZip(zipPath);

    // Vérifier zip avant envoi
    if (!fs.existsSync(zipPath)) {
      return reply("❌ Zip file was not created.");
    }
    const stats = fs.statSync(zipPath);
    if (stats.size > 100 * 1024 * 1024) { // 100 Mo
      return reply("❌ Zip file is too large to send via WhatsApp.");
    }

    // Envoi zip avec stream + gestion erreurs
    try {
      await conn.sendMessage(m.chat, {
        document: fs.createReadStream(zipPath),
        fileName: `${domain}.zip`,
        mimetype: "application/zip",
        caption: `📁 Website Source Code from: ${fullUrl}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ`
      }, { quoted: m });
    } catch (e) {
      console.error("Send message error:", e);
      return reply("❌ Error sending zip file.");
    }

    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.unlinkSync(zipPath);
  } catch (e) {
    console.error(e);
    reply("❌ Failed to fetch or process the website.");
  }
});
