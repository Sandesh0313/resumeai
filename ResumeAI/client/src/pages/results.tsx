import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreCircle } from "@/components/ui/score-circle";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ResumeAnalysisResponse } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

// Extended interface to include the usingFallback flag
interface ExtendedResumeAnalysisResponse extends ResumeAnalysisResponse {
  usingFallback?: boolean;
}

export default function Results() {
  const [, setLocation] = useLocation();
  const [analysis, setAnalysis] = useState<ExtendedResumeAnalysisResponse | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    // Get analysis from sessionStorage
    const storedAnalysis = sessionStorage.getItem("resumeAnalysis");
    const storedFileName = sessionStorage.getItem("resumeFileName");
    
    if (storedAnalysis) {
      try {
        setAnalysis(JSON.parse(storedAnalysis));
      } catch (error) {
        console.error("Error parsing stored analysis:", error);
        toast({
          title: "Error Loading Results",
          description: "Unable to load analysis results. Please try again.",
          variant: "destructive",
        });
        setLocation("/");
      }
    } else {
      // No analysis data found, redirect to home
      toast({
        title: "No Analysis Data",
        description: "No resume analysis data found. Please upload a resume to analyze.",
        variant: "destructive",
      });
      setLocation("/");
    }
    
    if (storedFileName) {
      setFileName(storedFileName);
    }
  }, [setLocation, toast]);

  const handleNewAnalysis = () => {
    // Clear the stored analysis
    sessionStorage.removeItem("resumeAnalysis");
    sessionStorage.removeItem("resumeFileName");
    setLocation("/");
  };

  if (!analysis) {
    return null; // Will redirect to home in useEffect
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Resume Analysis Results</h2>
          <Button 
            variant="ghost" 
            onClick={handleNewAnalysis}
            className="text-primary-600 hover:text-primary-800 font-medium"
          >
            <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            New Analysis
          </Button>
        </div>
        {fileName && (
          <p className="text-sm text-gray-500 mt-1">
            File: {fileName}
          </p>
        )}
      </div>

      {/* Fallback Notice Alert */}
      {analysis.usingFallback && (
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <svg 
            className="h-5 w-5 text-amber-500" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <AlertTitle className="text-amber-800 font-medium">Using Simulated Analysis</AlertTitle>
          <AlertDescription className="text-amber-700">
            We're currently using a simulated analysis engine since the OpenAI service is temporarily unavailable. 
            The analysis provided is based on general resume best practices and may not be as tailored as our AI-powered analysis.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ATS Score Card */}
        <Card className="overflow-hidden animate-in fade-in duration-300">
          <CardHeader className="bg-gray-50 border-b border-gray-200 py-5">
            <CardTitle className="text-lg flex items-center">
              <svg className="mr-2 h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              ATS Compatibility
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center">
            <ScoreCircle score={analysis.score} />
            <div className="text-center mt-4">
              <div className="text-lg font-semibold">{analysis.scoreLabel}</div>
              <p className="text-sm text-gray-500 mt-1">
                {analysis.score >= 80 
                  ? "Your resume is performing well for ATS systems"
                  : analysis.score >= 60 
                    ? "Your resume needs some improvements for ATS systems"
                    : "Your resume needs significant improvements for ATS systems"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Strengths Card */}
        <Card className="overflow-hidden animate-in fade-in duration-300 delay-100 lg:col-span-2">
          <CardHeader className="bg-gray-50 border-b border-gray-200 py-5">
            <CardTitle className="text-lg flex items-center">
              <svg className="mr-2 h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Resume Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="space-y-4">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-800">{strength}</p>
                  </div>
                </li>
              ))}
              {analysis.strengths.length === 0 && (
                <li className="text-gray-500 italic">No specific strengths identified</li>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Improvements Card */}
        <Card className="overflow-hidden animate-in fade-in duration-300 delay-200 lg:col-span-3">
          <CardHeader className="bg-gray-50 border-b border-gray-200 py-5">
            <CardTitle className="text-lg flex items-center">
              <svg className="mr-2 h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Suggested Improvements
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Content Improvements</h4>
                <ul className="space-y-3">
                  {analysis.contentImprovements.map((improvement, index) => (
                    <li key={index} className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-800">{improvement}</p>
                      </div>
                    </li>
                  ))}
                  {analysis.contentImprovements.length === 0 && (
                    <li className="text-gray-500 italic">No specific content improvements suggested</li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Formatting Improvements</h4>
                <ul className="space-y-3">
                  {analysis.formatImprovements.map((improvement, index) => (
                    <li key={index} className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-800">{improvement}</p>
                      </div>
                    </li>
                  ))}
                  {analysis.formatImprovements.length === 0 && (
                    <li className="text-gray-500 italic">No specific formatting improvements suggested</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Keyword Analysis Card */}
        <Card className="overflow-hidden animate-in fade-in duration-300 delay-300 lg:col-span-3">
          <CardHeader className="bg-gray-50 border-b border-gray-200 py-5">
            <CardTitle className="text-lg flex items-center">
              <svg className="mr-2 h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Keyword Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Job-Relevant Keywords Found</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.keywordsFound.map((keyword, index) => (
                  <Badge key={index} className="px-3 py-1 bg-green-100 text-green-800 hover:bg-green-200">
                    {keyword}
                  </Badge>
                ))}
                {analysis.keywordsFound.length === 0 && (
                  <p className="text-gray-500 italic">No job-relevant keywords found</p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Missing Keywords (consider adding if relevant)</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.keywordsMissing.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1 bg-gray-100 text-gray-800 hover:bg-gray-200">
                    {keyword}
                  </Badge>
                ))}
                {analysis.keywordsMissing.length === 0 && (
                  <p className="text-gray-500 italic">No missing keywords identified</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
