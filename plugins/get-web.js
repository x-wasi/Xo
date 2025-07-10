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
    const tmpDir = path.join(__dirname, "tmp_" + Date.now());
    fs.mkdirSync(tmpDir);

    // Save HTML
    fs.writeFileSync(path.join(tmpDir, "index.html"), html);

    const $ = cheerio.load(html);
    const base = new URL(fullUrl);
    const assets = [];

    const downloadAsset = async (src, filepath) => {
      try {
        const finalUrl = new URL(src, base).href;
        const data = await axios.get(finalUrl, { responseType: "arraybuffer" });
        const fullpath = path.join(tmpDir, filepath);

        // Make sure directory exists
        fs.mkdirSync(path.dirname(fullpath), { recursive: true });
        fs.writeFileSync(fullpath, data.data);
      } catch (e) {
        console.warn("❌ Failed to download:", src);
      }
    };

    // Télécharger CSS (dans dossier css)
    $('link[rel="stylesheet"]').each((_, el) => {
      const href = $(el).attr("href");
      if (href) {
        const filename = path.basename(href.split("?")[0]); // enlever query string
        assets.push(downloadAsset(href, path.join("css", filename)));
      }
    });

    // Télécharger JS (dans dossier js)
    $('script[src]').each((_, el) => {
      const src = $(el).attr("src");
      if (src) {
        const filename = path.basename(src.split("?")[0]);
        assets.push(downloadAsset(src, path.join("js", filename)));
      }
    });

    // Télécharger images (dans dossier images)
    $('img[src]').each((_, el) => {
      const src = $(el).attr("src");
      if (src) {
        const filename = path.basename(src.split("?")[0]);
        assets.push(downloadAsset(src, path.join("images", filename)));
      }
    });

    // Télécharger vidéos (dans dossier videos)
    $('video[src]').each((_, el) => {
      const src = $(el).attr("src");
      if (src) {
        const filename = path.basename(src.split("?")[0]);
        assets.push(downloadAsset(src, path.join("videos", filename)));
      }
    });

    // Télécharger sources audio (dans dossier audio)
    $('audio[src]').each((_, el) => {
      const src = $(el).attr("src");
      if (src) {
        const filename = path.basename(src.split("?")[0]);
        assets.push(downloadAsset(src, path.join("audio", filename)));
      }
    });

    // Télécharger sources <source> (ex: vidéo, audio, picture)
    $('source[src]').each((_, el) => {
      const src = $(el).attr("src");
      if (src) {
        const filename = path.basename(src.split("?")[0]);
        assets.push(downloadAsset(src, path.join("media", filename)));
      }
    });

    // Attendre que tous les assets soient téléchargés
    await Promise.all(assets);

    // ** BONUS ** : lire les fichiers CSS téléchargés et extraire les urls dans `url(...)` pour télécharger les polices ou images CSS (à faire ici de façon basique)
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
          if (!assetUrl.startsWith("data:")) { // ignore base64 inline
            const filename = path.basename(assetUrl.split("?")[0]);
            // Télécharger dans css/assets
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

    await conn.sendMessage(m.chat, {
      document: fs.readFileSync(zipPath),
      fileName: `${domain}.zip`,
      mimetype: "application/zip",
      caption: `📁 Website Source Code from: ${fullUrl}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ`
    }, { quoted: m });

    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.unlinkSync(zipPath);
  } catch (e) {
    console.error(e);
    reply("❌ Failed to fetch or process the website.");
  }
});
