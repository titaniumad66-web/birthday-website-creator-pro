import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { insertUserSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import { generateBirthdayContent } from "./aiService";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const templatesDir = path.resolve("server", "uploads", "templates");
  const assetsDir = path.resolve("server", "uploads", "assets");
  const paymentScreensDir = path.resolve("server", "uploads", "payments");
  const upload = multer({
    storage: multer.diskStorage({
      destination: async (_req, _file, cb) => {
        try {
          await fs.promises.mkdir(templatesDir, { recursive: true });
          cb(null, templatesDir);
        } catch (error) {
          cb(error as Error, templatesDir);
        }
      },
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${nanoid()}${ext}`);
      },
    }),
    fileFilter: (_req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
        return;
      }
      cb(new Error("Only image uploads are allowed"));
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  // Dedicated upload for Image Manager with dynamic destination by section
  const imageManagerUpload = multer({
    storage: multer.diskStorage({
      destination: async (req: any, _file, cb) => {
        try {
          const rawSection = typeof req.body?.section_name === "string" ? req.body.section_name : "";
          const section = rawSection
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
          const dir = path.resolve(assetsDir, section || "misc");
          await fs.promises.mkdir(dir, { recursive: true });
          cb(null, dir);
        } catch (error) {
          cb(error as Error, assetsDir);
        }
      },
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${nanoid()}${ext}`);
      },
    }),
    fileFilter: (_req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
        return;
      }
      cb(new Error("Only image uploads are allowed"));
    },
    limits: { fileSize: 6 * 1024 * 1024 },
  });

  const paymentUpload = multer({
    storage: multer.diskStorage({
      destination: async (_req, _file, cb) => {
        try {
          await fs.promises.mkdir(paymentScreensDir, { recursive: true });
          cb(null, paymentScreensDir);
        } catch (error) {
          cb(error as Error, paymentScreensDir);
        }
      },
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${nanoid()}${ext}`);
      },
    }),
    fileFilter: (_req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
        return;
      }
      cb(new Error("Only image uploads are allowed"));
    },
    limits: { fileSize: 6 * 1024 * 1024 },
  });

  // =========================
  // AUTH MIDDLEWARE
  // =========================
  function verifyToken(req: any, res: any, next: any) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      req.user = decoded;
      next();
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
  }

  function verifyAdmin(req: any, res: any, next: any) {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }
    next();
  }

  // =========================
  // REGISTER
  // =========================
  app.post("/api/register", async (req, res) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input" });
      }

      const { username, email, password } = parsed.data;

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await storage.createUser({
        username,
        email,
        password: hashedPassword,
      });

      const token = jwt.sign(
        { id: newUser.id, role: newUser.role },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      return res.status(201).json({
        message: "User registered successfully",
        token,
      });

    } catch (error) {
      console.error("Register Error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // =========================
  // LOGIN
  // =========================
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      return res.json({
        message: "Login successful",
        token,
      });

    } catch (error) {
      console.error("Login Error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // =========================
  // CREATE WEBSITE (Protected)
  // =========================
  app.post("/api/websites", verifyToken, async (req: any, res) => {
    try {
      const { title, theme, content } = req.body;

      // TEMPORARY: Monetization disabled — allow all creations without gating
      // Original checks preserved for future re-enable.

      const website = await storage.createWebsite({
        userId: req.user.id,
        title,
        theme,
        content,
      });

      // Free usage tracking disabled during monetization pause

      return res.status(201).json(website);
    } catch (error) {
      console.error("Create Website Error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // =========================
  // GET USER WEBSITES (Protected)
  // =========================
  app.get("/api/websites", verifyToken, async (req: any, res) => {
    try {
      const websites = await storage.getUserWebsites(req.user.id);
      return res.json(websites);
    } catch (error) {
      console.error("Fetch Websites Error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // =========================
  // ADMIN ROUTE
  // =========================
  app.get(
    "/api/admin/dashboard",
    verifyToken,
    verifyAdmin,
    (req, res) => {
      return res.json({
        message: "Welcome Admin 👑",
      });
    }
  );
  app.get("/api/admin/users", verifyToken, verifyAdmin, async (_req, res) => {
    try {
      const items = await storage.listUsers();
      return res.json(items);
    } catch (error) {
      console.error("Admin Users Error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  // =========================
  // TEMPLATES (PUBLIC LIST)
  // =========================
  app.get("/api/templates", async (_req, res) => {
    try {
      const templates = await storage.getTemplates();
      return res.json(templates);
    } catch (error) {
      console.error("Fetch Templates Error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // =========================
  // CREATE TEMPLATE (ADMIN)
  // =========================
  app.post(
    "/api/templates",
    verifyToken,
    verifyAdmin,
    upload.single("image"),
    async (req: any, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "Image is required" });
        }

        const rawName = typeof req.body?.name === "string" ? req.body.name : "";
        const rawTitle = typeof req.body?.title === "string" ? req.body.title : "";
        const resolvedTitle = (rawName || rawTitle).trim();
        const title = resolvedTitle ? resolvedTitle : "Untitled Template";

        const imageUrl = `/uploads/templates/${req.file.filename}`;

        const template = await storage.createTemplate({
          title,
          imageUrl,
        });

        return res.status(201).json(template);
      } catch (error) {
        console.error("Create Template Error:", error);
        return res.status(500).json({ message: "Server error" });
      }
    }
  );

  // =========================
  // DELETE TEMPLATE (ADMIN)
  // =========================
  app.delete(
    "/api/templates/:id",
    verifyToken,
    verifyAdmin,
    async (req, res) => {
      try {
        const { id } = req.params;
        const template = await storage.getTemplateById(id);
        if (!template) {
          return res.status(404).json({ message: "Template not found" });
        }

        await storage.deleteTemplate(id);

        if (template.imageUrl) {
          const filePath = path.resolve(
            "server",
            "uploads",
            "templates",
            path.basename(template.imageUrl)
          );
          fs.promises.unlink(filePath).catch(() => null);
        }

        return res.json({ message: "Template deleted" });
      } catch (error) {
        console.error("Delete Template Error:", error);
        return res.status(500).json({ message: "Server error" });
      }
    }
  );
  // =========================
  // AI ASSISTANT
  // =========================
  app.post("/api/ai-assistant", async (req, res) => {
    try {
      const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
      const context = req.body?.context && typeof req.body.context === "object" ? req.body.context : null;
      const contextName = typeof context?.name === "string" ? context.name : "";
      const contextRelationship = typeof context?.relationship === "string" ? context.relationship : "";
      const contextTheme = typeof context?.theme === "string" ? context.theme : "";
      const contextConfession =
        typeof context?.confessionMode === "boolean" ? context.confessionMode : false;
      const contextMemories =
        typeof context?.memoriesCount === "number" ? context.memoriesCount : undefined;
      const contextMessage = typeof context?.message === "string" ? context.message : "";
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const lower = message.toLowerCase();
      const relationshipLower = contextRelationship.toLowerCase();
      const themeLower = contextTheme.toLowerCase();
      const targetName = contextName || "them";
      const looksLikeImprove =
        lower.includes("improve") ||
        lower.includes("rewrite") ||
        lower.includes("make it more") ||
        lower.includes("polish") ||
        lower.includes("emotional") ||
        lower.includes("romantic");

      if (looksLikeImprove && (contextMessage || message).length > 20) {
        const base = contextMessage || message;
        const confessionLine = contextConfession
          ? "I’ve been meaning to say this for a while, and I hope it brings a gentle smile."
          : "";
        const relationshipLine =
          relationshipLower === "best friend"
            ? "You’ve been my favorite constant through every adventure and every laugh."
            : relationshipLower === "family"
              ? "Your love and support have shaped me in the best ways."
              : relationshipLower === "crush"
                ? "Every moment with you feels special, even from afar."
                : "You make life feel brighter and more meaningful.";
        return res.json({
          reply:
            "Here’s a more emotional version:\n\n" +
            `Happy Birthday ${contextName || ""}! ${relationshipLine} ${confessionLine} ` +
            "Today is all about celebrating the light you bring into the world, and I hope this surprise " +
            "wraps you in warmth, joy, and love. You deserve a day as unforgettable as you are.\n\n" +
            `Original: ${base}`,
        });
      }

      if (lower.includes("crush") || relationshipLower === "crush") {
        return res.json({
          reply:
            "For a crush, Romantic or Pastel works best. If Confession Mode is on, keep it subtle: warm gradients, soft text, and a gentle reveal make it feel sweet without being too intense.",
        });
      }

      if (lower.includes("theme") || lower.includes("vibe") || themeLower) {
        const themeAdvice =
          themeLower === "royal"
            ? "Royal pairs well with elegant phrasing, gold accents, and a dramatic reveal."
            : themeLower === "funny"
              ? "Funny works best with playful language, bright colors, and bold memories."
              : themeLower === "emotional"
                ? "Emotional thrives on warm pastels, soft fades, and heartfelt lines."
                : themeLower === "minimal"
                  ? "Minimal feels modern with clean typography and short, intentional sentences."
                  : themeLower === "pastel"
                    ? "Pastel is dreamy and soft, with gentle gradients and airy text."
                    : "Romantic shines with serif typography and tender, affectionate messages.";
        return res.json({
          reply:
            `${themeAdvice} Choose the vibe that mirrors your relationship: Romantic for partners, Emotional for heartfelt notes, Funny for best friends, Royal for dramatic luxury, Minimal for clean modern energy, and Pastel for dreamy softness.`,
        });
      }

      if (lower.includes("memories") || lower.includes("photos") || typeof contextMemories === "number") {
        const countHint =
          typeof contextMemories === "number"
            ? `You currently have ${contextMemories} memories. `
            : "";
        return res.json({
          reply:
            `${countHint}For the best flow, add 5–8 memories. That keeps the gallery feeling rich without overwhelming the surprise moment.`,
        });
      }

      if (lower.includes("features") || lower.includes("what can") || lower.includes("how does aura")) {
        return res.json({
          reply:
            "Aura helps you build birthday surprise websites with a reveal gate, music playback, memory gallery, Instagram teaser generator, shareable links, QR code sharing, replay surprise animation, and downloadable templates.",
        });
      }

      return res.json({
        reply:
          `Aura AI can guide you through themes, messages, and design choices. Tell me who it’s for and the vibe you want, and I’ll recommend the best setup for ${targetName}.`,
      });
    } catch (error) {
      console.error("AI Assistant Error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/ai/generate-birthday", async (req, res) => {
    try {
      const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
      const relationship = typeof req.body?.relationship === "string" ? req.body.relationship.trim() : "";
      const theme = typeof req.body?.theme === "string" ? req.body.theme.trim() : "";
      const tone = typeof req.body?.tone === "string" ? req.body.tone.trim() : theme || relationship || "romantic";
      const memories = Array.isArray(req.body?.memories) ? req.body.memories : [];

      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }

      const result = await generateBirthdayContent({
        name,
        relationship,
        theme,
        tone,
        memories,
      });

      return res.json(result);
    } catch (error) {
      console.error("AI Generate Birthday Error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  // =========================
// GET WEBSITE BY ID (PUBLIC)
// =========================
app.get("/api/websites/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const website = await storage.getWebsiteById(id);

    if (!website) {
      return res.status(404).json({ message: "Website not found" });
    }

    return res.json(website);
  } catch (error) {
    console.error("Fetch Website Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

  // =========================
  // SITE IMAGES (PUBLIC FETCH)
  // =========================
  app.get("/api/site-images", async (req, res) => {
    try {
      const section = typeof req.query?.section === "string" ? req.query.section : undefined;
      const images = await storage.getSiteImages(section);
      return res.json(images);
    } catch (error) {
      console.error("Get Site Images Error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // =========================
  // SITE IMAGES (ADMIN MANAGE)
  // =========================
  app.post(
    "/api/site-images",
    verifyToken,
    verifyAdmin,
    imageManagerUpload.single("image"),
    async (req: any, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "Image is required" });
        }
        const rawSection = typeof req.body?.section_name === "string" ? req.body.section_name : "";
        const section = rawSection
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

        const imageUrl = `/assets/${section}/${req.file.filename}`;
        const record = await storage.createSiteImage({
          sectionName: section,
          imageName: req.file.originalname,
          imageUrl,
        });
        return res.status(201).json(record);
      } catch (error) {
        console.error("Create Site Image Error:", error);
        return res.status(500).json({ message: "Server error" });
      }
    },
  );

  app.put(
    "/api/site-images/:id",
    verifyToken,
    verifyAdmin,
    imageManagerUpload.single("image"),
    async (req: any, res) => {
      try {
        const { id } = req.params;
        const existing = await storage.getSiteImageById(id);
        if (!existing) {
          return res.status(404).json({ message: "Image not found" });
        }

        if (!req.file) {
          return res.status(400).json({ message: "Image is required" });
        }

        // Remove old file
        if (existing.imageUrl) {
          const rel = existing.imageUrl.replace(/^\/assets\//, "");
          const oldPath = path.resolve(assetsDir, rel);
          fs.promises.unlink(oldPath).catch(() => null);
        }

        const section = existing.sectionName;
        const imageUrl = `/assets/${section}/${req.file.filename}`;
        const updated = await storage.updateSiteImage(id, {
          imageName: req.file.originalname,
          imageUrl,
        });
        return res.json(updated);
      } catch (error) {
        console.error("Update Site Image Error:", error);
        return res.status(500).json({ message: "Server error" });
      }
    },
  );

  app.delete(
    "/api/site-images/:id",
    verifyToken,
    verifyAdmin,
    async (req, res) => {
      try {
        const { id } = req.params;
        const existing = await storage.getSiteImageById(id);
        if (!existing) {
          return res.status(404).json({ message: "Image not found" });
        }

        if (existing.imageUrl) {
          const rel = existing.imageUrl.replace(/^\/assets\//, "");
          const oldPath = path.resolve(assetsDir, rel);
          fs.promises.unlink(oldPath).catch(() => null);
        }
        await storage.deleteSiteImage(id);
        return res.json({ message: "Deleted" });
      } catch (error) {
        console.error("Delete Site Image Error:", error);
        return res.status(500).json({ message: "Server error" });
      }
    },
  );

  // =========================
  // MONETIZATION
  // =========================
  app.get("/api/monetization/check", verifyToken, async (req: any, res) => {
    try {
      return res.json({ payment_required: false, reason: "disabled" });
    } catch (error) {
      console.error("Monetization Check Error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/monetization/info", async (_req: any, res) => {
    try {
      const prices = await storage.getPricing();
      const websitePrice =
        prices.find((p) => p.productName === "website_creation")?.price ?? "49";
      const upiId = process.env.UPI_ID || "aura@upi";
      const qr = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Aura&am=${encodeURIComponent(
        websitePrice,
      )}&cu=INR`;
      return res.json({ upiId, amount: websitePrice, qr });
    } catch (error) {
      console.error("Monetization Info Error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post(
    "/api/purchases",
    verifyToken,
    paymentUpload.single("screenshot"),
    async (req: any, res) => {
      try {
        return res.status(200).json({ message: "Payments disabled temporarily" });
      } catch (error) {
        console.error("Create Purchase Error:", error);
        return res.status(500).json({ message: "Server error" });
      }
    },
  );

  app.get("/api/purchases", verifyToken, verifyAdmin, async (req: any, res) => {
    try {
      const status = typeof req.query?.status === "string" ? req.query.status : undefined;
      const items = await storage.listPurchases(status);
      return res.json(items);
    } catch (error) {
      console.error("List Purchases Error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/purchases/:id/approve", verifyToken, verifyAdmin, async (req: any, res) => {
    try {
      await storage.updatePurchaseStatus(req.params.id, "approved");
      return res.json({ message: "Approved" });
    } catch (error) {
      console.error("Approve Purchase Error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/purchases/:id/reject", verifyToken, verifyAdmin, async (req: any, res) => {
    try {
      await storage.updatePurchaseStatus(req.params.id, "rejected");
      return res.json({ message: "Rejected" });
    } catch (error) {
      console.error("Reject Purchase Error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/admin/stats", verifyToken, verifyAdmin, async (_req: any, res) => {
    try {
      const stats = await storage.getTotals();
      return res.json(stats);
    } catch (error) {
      console.error("Admin Stats Error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/pricing", verifyToken, verifyAdmin, async (_req: any, res) => {
    try {
      const items = await storage.getPricing();
      return res.json(items);
    } catch (error) {
      console.error("Get Pricing Error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/pricing", verifyToken, verifyAdmin, async (req: any, res) => {
    try {
      const productName = typeof req.body?.product_name === "string" ? req.body.product_name : "";
      const price = typeof req.body?.price === "string" ? req.body.price : "";
      if (!productName || !price) {
        return res.status(400).json({ message: "Invalid input" });
      }
      const item = await storage.upsertPricing(productName, price);
      return res.json(item);
    } catch (error) {
      console.error("Upsert Pricing Error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  return httpServer;
}
