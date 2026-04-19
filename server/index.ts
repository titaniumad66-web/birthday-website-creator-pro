/* Loads `.env` from project root (do not duplicate with dotenv.config()). */
import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import fs from "fs";
import net from "net";
import path from "path";
import { ensureWebsiteUnlockColumns } from "./ensureDbSchema";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    limit: "10mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(
  express.urlencoded({
    limit: "10mb",
    extended: true,
  }),
);

const uploadsDir = path.resolve("server", "uploads");
const templatesDir = path.resolve("server", "uploads", "templates");
const assetsDir = path.resolve("server", "uploads", "assets");
const paymentScreensDir = path.resolve("server", "uploads", "payments");
fs.promises.mkdir(uploadsDir, { recursive: true }).catch(() => null);
fs.promises.mkdir(templatesDir, { recursive: true }).catch(() => null);
fs.promises.mkdir(assetsDir, { recursive: true }).catch(() => null);
fs.promises.mkdir(paymentScreensDir, { recursive: true }).catch(() => null);

app.use("/uploads", express.static("server/uploads"));
app.use("/assets", express.static("server/uploads/assets"));
app.use("/payments", express.static("server/uploads/payments"));
app.use("/ui-libs", express.static("ui-libs"));
app.use("/script.js", (req, res) => res.sendFile(path.resolve("script.js")));
app.use("/style.css", (req, res) => res.sendFile(path.resolve("style.css")));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

const envPort = process.env.PORT ? parseInt(process.env.PORT, 10) : NaN;
const DEFAULT_PORT =
  Number.isFinite(envPort) && envPort > 0 ? envPort : 5000;

function findAvailablePort(port: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();

    probe.once("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        resolve(findAvailablePort(port + 1));
      } else {
        reject(err);
      }
    });

    probe.once("listening", () => {
      probe.close(() => resolve(port));
    });

    probe.listen(port, "0.0.0.0");
  });
}

process.on("uncaughtException", (err) => {
  console.error("Unhandled Error:", err);
});

if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    const start = Date.now();
    const reqPath = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (reqPath.startsWith("/api")) {
        let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
        log(logLine);
      }
    });

    next();
  });
}

(async () => {
  try {
    await ensureWebsiteUnlockColumns();
    log("Database: websites unlock columns verified (unlock_at, early_unlocked).");
  } catch (err) {
    console.error(
      "[startup] ensureWebsiteUnlockColumns failed — run migrations or SQL manually. Continuing:",
      err,
    );
  }

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  let port: number;
  try {
    port = await findAvailablePort(DEFAULT_PORT);
  } catch (err) {
    console.error("[startup] Could not bind to an available port:", err);
    process.exit(1);
  }

  if (port !== DEFAULT_PORT) {
    log(`Port ${DEFAULT_PORT} busy, switching to ${port}`);
  }

  httpServer.listen(port, "0.0.0.0", () => {
    log(`🚀 Server running on port ${port}`);
  });
})();
