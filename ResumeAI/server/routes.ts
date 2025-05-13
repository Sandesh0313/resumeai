import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { analyzeResume } from "./controllers/resume-controller";

// Configure multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Resume analysis endpoint
  app.post(
    "/api/resume/analyze", 
    upload.single("file"), // Handle single file upload with field name "file"
    analyzeResume
  );

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
