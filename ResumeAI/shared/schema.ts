import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  jobRole: text("job_role"),
  fileName: text("file_name").notNull(),
  originalText: text("original_text").notNull(),
  analysis: text("analysis").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertResumeSchema = createInsertSchema(resumes).pick({
  jobRole: true,
  fileName: true,
  originalText: true,
  analysis: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumes.$inferSelect;

// API Response types
export const resumeAnalysisSchema = z.object({
  score: z.number().min(0).max(100),
  scoreLabel: z.string(),
  strengths: z.array(z.string()),
  contentImprovements: z.array(z.string()),
  formatImprovements: z.array(z.string()),
  keywordsFound: z.array(z.string()),
  keywordsMissing: z.array(z.string()),
  summary: z.string().optional(),
});

export type ResumeAnalysis = z.infer<typeof resumeAnalysisSchema>;
