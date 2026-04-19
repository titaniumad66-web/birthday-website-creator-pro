import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

//
// ================= USERS TABLE =================
//
export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),

  role: text("role").notNull().default("user"), // "user" or "admin"
  freeWebsiteUsed: boolean("free_website_used").notNull().default(false),

  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;


//
// ================= WEBSITES TABLE =================
//
export const websites = pgTable("websites", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),

  title: text("title").notNull(),
  theme: text("theme").notNull(),
  content: text("content").notNull(),

  /** Scheduled surprise reveal (optional; also mirrored inside JSON `content`). */
  unlockAt: timestamp("unlock_at"),
  earlyUnlocked: boolean("early_unlocked").notNull().default(false),

  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWebsiteSchema = createInsertSchema(websites).pick({
  title: true,
  theme: true,
  content: true,
});

export type InsertWebsite = z.infer<typeof insertWebsiteSchema>;
export type Website = typeof websites.$inferSelect;


// ================= TEMPLATES TABLE =================
export const templates = pgTable("templates", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTemplateSchema = createInsertSchema(templates).pick({
  title: true,
  imageUrl: true,
});

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

// ================= SITE IMAGES TABLE =================
export const siteImages = pgTable("site_images", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  sectionName: text("section_name").notNull(),
  imageName: text("image_name").notNull(),
  imageUrl: text("image_url").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSiteImageSchema = createInsertSchema(siteImages).pick({
  sectionName: true,
  imageName: true,
  imageUrl: true,
});

export type InsertSiteImage = z.infer<typeof insertSiteImageSchema>;
export type SiteImage = typeof siteImages.$inferSelect;

// ================= PRICING TABLE =================
export const pricing = pgTable("pricing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productName: text("product_name").notNull(),
  price: text("price").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPricingSchema = createInsertSchema(pricing).pick({
  productName: true,
  price: true,
});

export type InsertPricing = z.infer<typeof insertPricingSchema>;
export type Pricing = typeof pricing.$inferSelect;

// ================= PURCHASES TABLE =================
export const purchases = pgTable("purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  productType: text("product_type").notNull(),
  amount: text("amount").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  paymentScreenshot: text("payment_screenshot"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPurchaseSchema = createInsertSchema(purchases).pick({
  userId: true,
  productType: true,
  amount: true,
  paymentStatus: true,
  paymentScreenshot: true,
});

export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Purchase = typeof purchases.$inferSelect;
