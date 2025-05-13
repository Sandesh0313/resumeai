import { apiRequest } from "./queryClient";
import { ResumeAnalysisRequest, ResumeAnalysisResponse, resumeAnalysisResponseSchema } from "./types";
import { useToast } from "@/hooks/use-toast";

export const useResumeService = () => {
  const { toast } = useToast();

  const analyzeResume = async (data: ResumeAnalysisRequest): Promise<ResumeAnalysisResponse | null> => {
    try {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("jobRole", data.jobRole);

      const response = await fetch("/api/resume/analyze", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to analyze resume: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      // Validate the response against our schema
      const parsedResponse = resumeAnalysisResponseSchema.parse(result);
      return parsedResponse;
    } catch (error) {
      console.error("Resume analysis error:", error);
      toast({
        title: "Resume Analysis Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    analyzeResume,
  };
};
