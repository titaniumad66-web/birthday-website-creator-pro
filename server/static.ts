import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { applyOgToIndexHtml } from "./surpriseOg";

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("/{*path}", async (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    let html = await fs.promises.readFile(indexPath, "utf-8");
    html = await applyOgToIndexHtml(req, req.path, html);
    res.status(200).set({ "Content-Type": "text/html" }).send(html);
  });
}
