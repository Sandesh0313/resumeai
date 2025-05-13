import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { JobSelect } from "@/components/job-select";
import { useResumeService } from "@/lib/resume-service";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedRole, setSelectedRole] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [_, setLocation] = useLocation();
  const resumeService = useResumeService();
  const { toast } = useToast();

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please upload a PDF resume to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await resumeService.analyzeResume({
        file: selectedFile,
        jobRole: selectedRole,
      });

      if (result) {
        // Store result in sessionStorage for the results page
        sessionStorage.setItem("resumeAnalysis", JSON.stringify(result));
        sessionStorage.setItem("resumeFileName", selectedFile.name);
        
        // Navigate to results page
        setLocation("/results");
      } else {
        // Error was handled inside the analyzeResume function
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Resume analysis error:", error);
      toast({
        title: "Resume Analysis Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Smart Resume Analysis</h1>
        <p className="mt-3 text-lg text-gray-500">
          Upload your resume to get AI-powered feedback and improve your chances of landing that job
        </p>
      </div>

      {isLoading ? (
        // Loading State
        <Card className="mb-10">
          <CardContent className="p-8 text-center">
            <div className="mx-auto max-w-md">
              <div className="animate-pulse flex flex-col items-center">
                <div className="rounded-full bg-primary-100 h-20 w-20 flex items-center justify-center mb-4">
                  <svg className="h-10 w-10 text-primary-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <div className="h-6 bg-primary-100 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              </div>
              <p className="text-lg font-medium text-gray-700 mt-6">Analyzing your resume...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments as our AI evaluates your resume</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Upload Section
        <Card className="mb-10">
          <CardContent className="p-6">
            <JobSelect selectedRole={selectedRole} onRoleSelect={handleRoleSelect} />
            <FileUpload selectedFile={selectedFile} onFileSelect={handleFileSelect} />
            <div className="mt-6 flex justify-center">
              <Button 
                className="px-6 py-3 text-base font-medium"
                onClick={handleAnalyze}
                disabled={!selectedFile}
              >
                <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Analyze Resume
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
