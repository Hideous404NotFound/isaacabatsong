import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "dist");
const PORT = Number(process.env.PORT || 4173);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2"
};

if (!fs.existsSync(ROOT)) {
  console.error("Le dossier dist/ n'existe pas. Lancez d'abord : npm run build");
  process.exit(1);
}

function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  const relative = clean.replace(/^\/+/, "");
  let file = path.join(ROOT, relative);

  if (!file.startsWith(ROOT)) return null;

  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    file = path.join(file, "index.html");
  }

  if (!fs.existsSync(file) && !path.extname(file)) {
    const withHtml = `${file}.html`;
    if (fs.existsSync(withHtml)) return withHtml;
    const asIndex = path.join(file, "index.html");
    if (fs.existsSync(asIndex)) return asIndex;
  }

  return fs.existsSync(file) && fs.statSync(file).isFile() ? file : null;
}

const server = http.createServer((request, response) => {
  const file = resolveFile(request.url || "/");

  if (!file) {
    const notFound = path.join(ROOT, "404.html");
    if (fs.existsSync(notFound)) {
      response.writeHead(404, { "Content-Type": MIME[".html"] });
      fs.createReadStream(notFound).pipe(response);
      return;
    }
    response.writeHead(404, { "Content-Type": MIME[".txt"] });
    response.end("404");
    return;
  }

  const extension = path.extname(file).toLowerCase();
  response.writeHead(200, {
    "Content-Type": MIME[extension] || "application/octet-stream",
    "Cache-Control": "no-cache"
  });
  fs.createReadStream(file).pipe(response);
});

server.listen(PORT, () => {
  console.log(`Aperçu local : http://localhost:${PORT}`);
  console.log("Ctrl+C pour arrêter.");
});
