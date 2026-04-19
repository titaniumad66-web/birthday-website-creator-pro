import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { storage } from "./storage";

/** Minimal valid 1×1 PNG — last resort; prefer `client/public/og-share-default.png` (≥300×200 for WhatsApp). */
const OG_DEFAULT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60EH6wAAAABJRU5ErkJggg==",
  "base64",
);

let cachedDefaultOg: Buffer | null = null;

function resolveDefaultOgBuffer(): Buffer {
  if (cachedDefaultOg) return cachedDefaultOg;
  const candidates = [
    path.resolve(process.cwd(), "client", "public", "og-share-default.png"),
    path.resolve(process.cwd(), "dist", "public", "og-share-default.png"),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        cachedDefaultOg = fs.readFileSync(p);
        return cachedDefaultOg;
      }
    } catch {
      /* ignore */
    }
  }
  cachedDefaultOg = OG_DEFAULT_PNG;
  return cachedDefaultOg;
}

export function sendOgDefaultPng(_req: Request, res: Response) {
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=604800, immutable");
  res.send(resolveDefaultOgBuffer());
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;");
}

export function previewImageFromContentString(content: string): string | undefined {
  try {
    const j = JSON.parse(content) as {
      type?: string;
      image?: string;
      memories?: Array<{ image?: string; isFeatured?: boolean }>;
    };
    if (j?.type === "letter" && j.image) return j.image;
    const mems = j.memories;
    if (!Array.isArray(mems)) return undefined;
    const featured = mems.find((m) => m?.isFeatured && m.image);
    const first = mems.find((m) => m?.image);
    return (featured?.image || first?.image) ?? undefined;
  } catch {
    return undefined;
  }
}

export function buildCanonicalUrl(req: Request, pathname: string): string {
  const xf = req.get("x-forwarded-proto");
  const proto = (xf?.split(",")[0]?.trim() || req.protocol || "https").replace(/:$/, "");
  const host = req.get("host") || "localhost";
  const pathOnly = pathname.split("?")[0] || "/";
  return `${proto}://${host}${pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`}`;
}

function resolveOgImageUrl(req: Request, raw: string | undefined): string {
  const origin = buildCanonicalUrl(req, "/").replace(/\/$/, "");
  const defaultImg = `${origin}/og-share-default.png`;
  if (!raw || typeof raw !== "string") return defaultImg;
  const p = raw.trim();
  if (p.startsWith("data:")) return defaultImg;
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("/")) return `${origin}${p}`;
  return defaultImg;
}

function stripDefaultSocialMeta(html: string): string {
  return html
    .replace(/<meta[^>]*property="og:[^"]*"[^>]*>\s*/gi, "")
    .replace(/<meta[^>]*name="twitter:[^"]*"[^>]*>\s*/gi, "");
}

const SURPRISE_PATH = /^\/(?:w|letter)\/([a-zA-Z0-9_-]+)\/?$/;

/**
 * For shared surprise URLs, inject Open Graph + Twitter Card tags into index.html
 * so WhatsApp / Facebook see rich previews without running the SPA.
 */
export async function applyOgToIndexHtml(
  req: Request,
  pathname: string,
  html: string,
): Promise<string> {
  const clean = (pathname.split("?")[0] || "/").replace(/\/+$/, "") || "/";
  const m = clean.match(SURPRISE_PATH);
  if (!m) return html;

  const id = m[1];
  const site = await storage.getWebsiteById(id);
  if (!site || typeof site.content !== "string") return html;

  const preview = previewImageFromContentString(site.content);
  const ogUrl = buildCanonicalUrl(req, clean);
  const ogImage = resolveOgImageUrl(req, preview);

  const title = "A surprise for you 🎁";
  const desc = "Someone made this just for you ❤️";

  const block = `
    <meta property="og:title" content="${escapeAttr(title)}" />
    <meta property="og:description" content="${escapeAttr(desc)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeAttr(ogUrl)}" />
    <meta property="og:image" content="${escapeAttr(ogImage)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(title)}" />
    <meta name="twitter:description" content="${escapeAttr(desc)}" />
    <meta name="twitter:image" content="${escapeAttr(ogImage)}" />
    <link rel="canonical" href="${escapeAttr(ogUrl)}" />
`;

  const out = stripDefaultSocialMeta(html);
  return out.replace(/<\/head>/i, `${block}\n  </head>`);
}
