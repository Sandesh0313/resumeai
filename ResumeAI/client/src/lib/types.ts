import { z } from "zod";

// File upload types
export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

// Job role selection types
export interface JobSelectProps {
  selectedRole: string;
  onRoleSelect: (role: string) => void;
}

export const jobRoleOptions = [
  { value: "general", label: "General Resume Evaluation" },
  { value: "frontend", label: "Frontend Developer" },
  { value: "backend", label: "Backend Developer" },
  { value: "fullstack", label: "Full Stack Developer" },
  { value: "data", label: "Data Analyst" },
  { value: "design", label: "UI/UX Designer" },
  { value: "product", label: "Product Manager" },
  { value: "marketing", label: "Marketing Specialist" },
  { value: "sales", label: "Sales Representative" },
];

// Resume analysis types
export type ResumeAnalysisRequest = {
  file: File;
  jobRole: string;
};

export const resumeAnalysisResponseSchema = z.object({
  score: z.number().min(0).max(100),
  scoreLabel: z.string(),
  strengths: z.array(z.string()),
  contentImprovements: z.array(z.string()),
  formatImprovements: z.array(z.string()),
  keywordsFound: z.array(z.string()),
  keywordsMissing: z.array(z.string()),
  summary: z.string().optional(),
  usingFallback: z.boolean().optional(),
});

export type ResumeAnalysisResponse = z.infer<typeof resumeAnalysisResponseSchema>;
