// Minimal static file server for the project root.
// Usage: node serve.mjs  →  http://localhost:3001
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const PORT = Number(process.env.PORT) || 3001;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".mp4": "video/mp4",
  ".txt": "text/plain; charset=utf-8",
};

const server = createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (urlPath.endsWith("/")) urlPath += "index.html";
    const filePath = normalize(join(ROOT, urlPath));
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403); res.end("Forbidden"); return;
    }
    let target = filePath;
    const info = await stat(target).catch(() => null);
    if (info?.isDirectory()) target = join(target, "index.html");
    let data = await readFile(target);
    const type = MIME[extname(target).toLowerCase()] || "application/octet-stream";
    // Dev-only approximation of production hosting: gzip text, allow revalidation (no-store blocks bfcache).
    const headers = { "Content-Type": type, "Cache-Control": "no-cache", "Vary": "Accept-Encoding" };
    if ((type.startsWith("text/") || ["application/javascript", "application/json", "application/xml"].includes(type.split(";")[0])) && String(req.headers["accept-encoding"] || "").includes("gzip")) { data = gzipSync(data); headers["Content-Encoding"] = "gzip"; }
    res.writeHead(200, headers);
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`Port ${PORT} already in use — server is probably running already.`);
    process.exit(0);
  }
  throw err;
});

server.listen(PORT, () => console.log(`Serving ${ROOT} at http://localhost:${PORT}`));
