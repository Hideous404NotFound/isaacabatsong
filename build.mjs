import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import {
  SITE_URL,
  site,
  projects,
  galleryItems,
  personalPhotos,
  services
} from "./src/content.mjs";
import { buildPages, buildNotFound } from "./src/pages.mjs";

const ROOT = process.cwd();
const SRC_IMAGES = path.join(ROOT, "images");
const DIST = path.join(ROOT, "dist");
const IMAGE_EXT = /\.(jpe?g|png|webp|avif)$/i;
const TODAY = new Date().toISOString().slice(0, 10);

const mediaCache = new Map();
let processedCount = 0;

function hashString(value) {
  return crypto.createHash("sha1").update(value).digest("hex");
}

function listImages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => IMAGE_EXT.test(file))
    .sort((a, b) => a.localeCompare(b, "fr"));
}

function widthsFor(width) {
  const max = Math.min(width, 2000);
  const targets = [480, 800, 1200, 1600, 2000].filter((w) => w <= max);
  if (!targets.includes(max)) targets.push(max);
  return [...new Set(targets)].sort((a, b) => a - b);
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) break;
      results[index] = await fn(items[index], index);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}

async function processMedia(relativePath) {
  const key = relativePath.split(path.sep).join("/");
  if (mediaCache.has(key)) return mediaCache.get(key);

  const promise = (async () => {
    const absolute = path.join(SRC_IMAGES, key);
    if (!fs.existsSync(absolute)) {
      throw new Error(`Image introuvable : ${absolute}`);
    }

    const metadata = await sharp(absolute).metadata();
    let width = metadata.width || 0;
    let height = metadata.height || 0;
    if ([5, 6, 7, 8].includes(metadata.orientation)) {
      [width, height] = [height, width];
    }
    if (!width || !height) {
      throw new Error(`Dimensions illisibles : ${absolute}`);
    }

    const hash = hashString(key).slice(0, 10);
    const variants = [];

    for (const target of widthsFor(width)) {
      const outputRelative = `img/media/${hash}-${target}.webp`;
      const outputAbsolute = path.join(DIST, outputRelative);
      await fsp.mkdir(path.dirname(outputAbsolute), { recursive: true });
      const info = await sharp(absolute)
        .rotate()
        .resize({ width: target, withoutEnlargement: true })
        .webp({ quality: 80, effort: 4 })
        .toFile(outputAbsolute);
      variants.push({
        url: `/${outputRelative}`,
        width: info.width,
        height: info.height
      });
    }

    variants.sort((a, b) => a.width - b.width);
    const srcVariant =
      variants.find((variant) => variant.width >= 800) ||
      variants[variants.length - 1];
    const full = variants[variants.length - 1];

    processedCount += 1;
    if (processedCount % 15 === 0) {
      console.log(`  images : ${processedCount} traitées`);
    }

    return {
      src: srcVariant.url,
      srcset: variants
        .map((variant) => `${variant.url} ${variant.width}w`)
        .join(", "),
      width: srcVariant.width,
      height: srcVariant.height,
      full: full.url,
      fullWidth: full.width,
      fullHeight: full.height,
      variants
    };
  })();

  mediaCache.set(key, promise);
  return promise;
}

function humanize(filename, index) {
  const base = filename
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (/^(artboard|visuel|image|img)\s*\d*$/i.test(base) || /^\d+$/.test(base)) {
    return { fr: `visuel ${index + 1}`, en: `visual ${index + 1}` };
  }

  const label = base
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return { fr: label, en: label };
}

async function generateOg(sourceRelative, outputName) {
  const source = path.join(SRC_IMAGES, sourceRelative);
  if (!fs.existsSync(source)) return;
  const output = path.join(DIST, "og", outputName);
  await fsp.mkdir(path.dirname(output), { recursive: true });
  await sharp(source)
    .rotate()
    .resize(1200, 630, { fit: "cover", position: "centre" })
    .jpeg({ quality: 84, mozjpeg: true, progressive: true })
    .toFile(output);
}

async function buildRegistry() {
  const images = { projects: {}, services: {} };

  console.log("Traitement des images…");
  const projectFiles = {};
  const uniqueSources = new Set();

  for (const project of projects) {
    const files = listImages(path.join(SRC_IMAGES, "projets", project.folder));
    if (!files.length) {
      throw new Error(`Aucun visuel dans le dossier du projet ${project.slug}`);
    }
    projectFiles[project.slug] = files;
    for (const file of files) {
      uniqueSources.add(`projets/${project.folder}/${file}`);
    }
  }

  const galleryFiles = listImages(path.join(SRC_IMAGES, "galerie-libre"));
  for (const file of galleryFiles) {
    uniqueSources.add(`galerie-libre/${file}`);
  }

  const personalFiles = listImages(path.join(SRC_IMAGES, "profil"));
  for (const file of personalFiles) {
    uniqueSources.add(`profil/${file}`);
  }

  uniqueSources.add("profil/image-de-isaac-abatsong-3.png");

  for (const service of services) {
    for (const item of service.images) {
      uniqueSources.add(`projets/${item.folder}/${item.file}`);
    }
  }

  await mapLimit([...uniqueSources], 4, (source) => processMedia(source));

  for (const project of projects) {
    const files = projectFiles[project.slug];
    const gallery = await Promise.all(
      files.map(async (file, index) => ({
        ...(await processMedia(`projets/${project.folder}/${file}`)),
        file,
        label: humanize(file, index)
      }))
    );

    const coverFile = files.includes(project.cover) ? project.cover : files[0];
    const coverIndex = files.indexOf(coverFile);
    const cover = gallery[coverIndex];

    images.projects[project.slug] = { cover, gallery, coverFile };
  }

  const personalKnown = new Map(personalPhotos.map((item) => [item.file, item]));
  images.personal = await Promise.all(
    personalFiles.map(async (file, index) => {
      const known = personalKnown.get(file);
      return {
        ...(await processMedia(`profil/${file}`)),
        file,
        alt: known
          ? known.alt
          : {
              fr: `Isaac Abatsong, photo ${index + 1}`,
              en: `Isaac Abatsong, photo ${index + 1}`
            }
      };
    })
  );

  const galleryKnown = new Map(galleryItems.map((item) => [item.file, item]));
  images.gallery = await Promise.all(
    galleryFiles.map(async (file, index) => {
      const known = galleryKnown.get(file);
      return {
        ...(await processMedia(`galerie-libre/${file}`)),
        file,
        label: known ? known.label : humanize(file, index)
      };
    })
  );

  images.hero = await processMedia("profil/image-de-isaac-abatsong-3.png");

  for (const service of services) {
    images.services[service.slug] = await Promise.all(
      service.images.map(async (item, index) => ({
        ...(await processMedia(`projets/${item.folder}/${item.file}`)),
        file: item.file,
        label: humanize(item.file, index)
      }))
    );
  }

  await generateOg(
    "projets/campagne-sportive-NEVRA-SPORTS/Artboard16.jpg",
    "default.jpg"
  );
  for (const project of projects) {
    const cover = images.projects[project.slug].coverFile;
    await generateOg(`projets/${project.folder}/${cover}`, `${project.slug}.jpg`);
  }

  return images;
}

async function writeAssets() {
  const styles = await fsp.readFile(path.join(ROOT, "src", "styles.css"), "utf8");
  const script = await fsp.readFile(path.join(ROOT, "src", "main.js"), "utf8");
  const cssName = `styles.${hashString(styles).slice(0, 8)}.css`;
  const jsName = `main.${hashString(script).slice(0, 8)}.js`;

  await fsp.mkdir(path.join(DIST, "assets"), { recursive: true });
  await fsp.writeFile(path.join(DIST, "assets", cssName), styles);
  await fsp.writeFile(path.join(DIST, "assets", jsName), script);

  return { css: cssName, js: jsName };
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function writeSitemap(pages) {
  const groups = new Map();
  for (const page of pages) {
    if (!groups.has(page.key)) groups.set(page.key, {});
    groups.get(page.key)[page.lang] = page;
  }

  const sorted = pages
    .slice()
    .sort((a, b) => {
      const priority = Number(b.priority) - Number(a.priority);
      return priority !== 0 ? priority : a.path.localeCompare(b.path);
    });

  const urls = sorted
    .map((page) => {
      const group = groups.get(page.key) || {};
      const fr = group.fr;
      const en = group.en;
      return `
  <url>
    <loc>${xmlEscape(`${SITE_URL}${page.path}`)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    ${
      fr
        ? `<xhtml:link rel="alternate" hreflang="fr" href="${xmlEscape(`${SITE_URL}${fr.path}`)}"/>`
        : ""
    }
    ${
      en
        ? `<xhtml:link rel="alternate" hreflang="en" href="${xmlEscape(`${SITE_URL}${en.path}`)}"/>`
        : ""
    }
    ${
      fr
        ? `<xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(`${SITE_URL}${fr.path}`)}"/>`
        : ""
    }
  </url>`;
    })
    .join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
  await fsp.writeFile(path.join(DIST, "sitemap.xml"), sitemap);
}

async function writeStaticFiles() {
  const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#000000"/>
  <circle cx="32" cy="32" r="17" fill="none" stroke="#FFD191" stroke-width="3"/>
  <circle cx="32" cy="32" r="5" fill="#FFD191"/>
</svg>`;
  await fsp.writeFile(path.join(DIST, "favicon.svg"), favicon);
  await sharp(Buffer.from(favicon))
    .resize(180, 180)
    .png()
    .toFile(path.join(DIST, "apple-touch-icon.png"));

  const manifest = {
    name: "Isaac Abatsong",
    short_name: "Isaac A.",
    description:
      "Portfolio d'Isaac Abatsong, graphiste, stratège de marque et community manager à Yaoundé.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    lang: "fr",
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  };
  await fsp.writeFile(
    path.join(DIST, "site.webmanifest"),
    JSON.stringify(manifest, null, 2)
  );

  const robots = `User-agent: *
Allow: /

# Moteurs de recherche
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# Robots des moteurs génératifs et des IA
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
  await fsp.writeFile(path.join(DIST, "robots.txt"), robots);

  const headers = `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/img/*
  Cache-Control: public, max-age=31536000, immutable

/og/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: public, max-age=0, must-revalidate
`;
  await fsp.writeFile(path.join(DIST, "_headers"), headers);

  const netlify = `[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"
`;
  await fsp.writeFile(path.join(ROOT, "netlify.toml"), netlify);
}

async function main() {
  console.log("Nettoyage de dist…");
  await fsp.rm(DIST, { recursive: true, force: true });
  await fsp.mkdir(DIST, { recursive: true });

  const images = await buildRegistry();
  console.log(`Images prêtes : ${processedCount} sources traitées.`);

  const assets = await writeAssets();
  const pages = buildPages({ images, assets });

  for (const page of pages) {
    let relative;
    if (page.path === "/") relative = "index.html";
    else if (page.path.endsWith("/")) relative = `${page.path.slice(1)}index.html`;
    else relative = page.path.slice(1);
    const output = path.join(DIST, relative);
    await fsp.mkdir(path.dirname(output), { recursive: true });
    await fsp.writeFile(output, page.html);
    console.log(`  page : ${page.path}`);
  }

  await fsp.writeFile(
    path.join(DIST, "404.html"),
    buildNotFound({ images, assets })
  );

  await writeSitemap(pages);
  await writeStaticFiles();

  console.log("");
  console.log(`Site généré dans ${DIST}`);
  console.log(`Pages : ${pages.length + 1}`);
  console.log(`URL canonique : ${SITE_URL}`);
  console.log(`Contact : ${site.email}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
