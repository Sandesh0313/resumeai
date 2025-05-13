import { Request, Response } from "express";
import { generateResumeAnalysis } from "../services/openai-service";
import { extractTextFromPDF } from "../services/pdf-service";
import { storage } from "../storage";
import { resumeAnalysisSchema } from "@shared/schema";

// Extend the Express request interface to include the file
declare global {
  namespace Express {
    interface Request {
      file?: {
        buffer: Buffer;
        mimetype: string;
        size: number;
        originalname: string;
      };
    }
  }
}

// Flag to track if we're using the fallback
let usingFallback = false;

export const analyzeResume = async (req: Request, res: Response) => {
  try {
    // Reset the fallback flag at the beginning of each request
    usingFallback = false;
    
    // Check if file exists in the request
    if (!req.file) {
      return res.status(400).json({ message: "No resume file uploaded" });
    }

    const file = req.file;
    const jobRole = req.body.jobRole || "";

    // Check file type
    if (file.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Only PDF files are accepted" });
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return res.status(400).json({ message: "File size exceeds 5MB limit" });
    }

    // Extract text from PDF
    const extractedText = await extractTextFromPDF(file.buffer);
    
    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ message: "Could not extract text from the PDF. Please ensure the file contains text content and is not password-protected." });
    }

    // Generate analysis using OpenAI
    const analysis = await generateResumeAnalysis(extractedText, jobRole);
    
    // Check if we're using the fallback by seeing if the summary contains our fallback text
    usingFallback = analysis.summary === "This resume has a good foundation but could benefit from more specific achievements and tailored content for the target role.";
    
    // Validate the analysis against our schema
    const validatedAnalysis = resumeAnalysisSchema.parse(analysis);

    // Store the resume analysis in storage
    const resumeData = {
      jobRole,
      fileName: file.originalname,
      originalText: extractedText,
      analysis: JSON.stringify(validatedAnalysis),
      createdAt: new Date().toISOString(),
    };

    const savedResume = await storage.createResume(resumeData);

    // If we're using the fallback, add a notice to the response
    const responseData = {
      ...validatedAnalysis,
      usingFallback: usingFallback
    };

    // Return the analysis to the client
    return res.status(200).json(responseData);
  } catch (error: unknown) {
    console.error("Resume analysis error:", error);
    
    // Handle specific errors
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(500).json({ 
        message: "Invalid response format from analysis service",
        details: (error as any).errors
      });
    }
    
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during resume analysis";
    return res.status(500).json({ 
      message: errorMessage
    });
  }
};
