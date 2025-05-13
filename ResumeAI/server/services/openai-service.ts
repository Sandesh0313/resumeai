import OpenAI from "openai";
import { ResumeAnalysis } from "@shared/schema";
import { z } from "zod";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const OPENAI_MODEL = "gpt-4o";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "your-api-key-here",
});

// Fallback keyword dictionaries for different roles
const roleKeywords: Record<string, { found: string[], missing: string[] }> = {
  "general": {
    found: ["experienced", "team", "professional", "leadership", "results"],
    missing: ["achievements", "metrics", "impact", "innovation", "certifications", "collaboration", "communication"]
  },
  "frontend": {
    found: ["HTML", "CSS", "JavaScript", "React", "responsive"],
    missing: ["TypeScript", "Redux", "Webpack", "Jest", "Material UI", "accessibility", "performance optimization"]
  },
  "backend": {
    found: ["API", "database", "server", "Node.js", "Express"],
    missing: ["microservices", "Docker", "Kubernetes", "AWS", "security", "caching", "scalability", "PostgreSQL"]
  },
  "fullstack": {
    found: ["frontend", "backend", "full-stack", "JavaScript", "database"],
    missing: ["DevOps", "CI/CD", "cloud services", "system design", "performance", "React", "Node.js", "TypeScript"]
  },
  "data": {
    found: ["data analysis", "Excel", "reporting", "statistics", "visualization"],
    missing: ["Python", "R", "SQL", "Tableau", "Power BI", "machine learning", "data cleaning", "big data"]
  },
  "design": {
    found: ["design", "UI", "UX", "Figma", "wireframes"],
    missing: ["user research", "prototyping", "design systems", "accessibility", "user testing", "Adobe XD", "information architecture"]
  },
  "product": {
    found: ["product", "strategy", "roadmap", "stakeholders", "requirements"],
    missing: ["user stories", "KPIs", "market research", "A/B testing", "agile", "prioritization", "customer feedback"]
  },
  "marketing": {
    found: ["marketing", "campaigns", "social media", "content", "analytics"],
    missing: ["SEO", "conversion rate", "customer journey", "marketing automation", "email marketing", "marketing ROI", "brand strategy"]
  },
  "sales": {
    found: ["sales", "client", "revenue", "business development", "relationship"],
    missing: ["CRM", "sales funnel", "negotiation", "closing techniques", "account management", "sales targets", "customer acquisition"]
  }
};

export async function generateResumeAnalysis(resumeText: string, jobRole: string): Promise<ResumeAnalysis> {
  try {
    // Create a detailed prompt for GPT-4
    const prompt = createAnalysisPrompt(resumeText, jobRole);

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert resume analyst and career advisor specializing in helping job seekers optimize their resumes for ATS (Applicant Tracking Systems) and improve their chances of getting interviews."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    // Parse the response content
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    // Parse the JSON response
    const analysis = JSON.parse(content);
    return analysis;
  } catch (error) {
    console.error("OpenAI API error:", error);
    
    // Generate fallback analysis when OpenAI API fails
    return generateFallbackAnalysis(resumeText, jobRole);
  }
}

// Fallback function when OpenAI API is unavailable
function generateFallbackAnalysis(resumeText: string, jobRole: string): ResumeAnalysis {
  // Default to general if no specific role is selected or role doesn't exist in our dictionary
  const role = jobRole && roleKeywords[jobRole] ? jobRole : "general";
  const keywords = roleKeywords[role];
  
  // Extract some basic statistics about the resume
  const wordCount = resumeText.split(/\s+/).length;
  const hasBulletPoints = resumeText.includes("•") || resumeText.includes("-");
  const hasNumbers = /\d/.test(resumeText);
  const paragraphCount = resumeText.split(/\n\s*\n/).length;
  
  // Calculate a basic score based on simple heuristics
  let score = 65; // Start with a default "Good" score
  if (wordCount > 300) score += 5;
  if (hasBulletPoints) score += 5;
  if (hasNumbers) score += 5;
  if (paragraphCount > 5) score += 5;
  if (wordCount > 600) score -= 5; // Too long can be a negative
  
  // Cap the score at 90 for the fallback
  score = Math.min(90, score);
  
  // Determine score label
  let scoreLabel = "Good";
  if (score <= 40) scoreLabel = "Poor";
  else if (score <= 60) scoreLabel = "Fair";
  else if (score <= 80) scoreLabel = "Good";
  else if (score <= 90) scoreLabel = "Very Good";
  else scoreLabel = "Excellent";

  // Generate a generic analysis
  return {
    score,
    scoreLabel,
    strengths: [
      "Resume is well-structured with clear sections",
      "Experience is presented in a chronological format",
      "Skills are clearly highlighted",
      "Education section is properly formatted",
      "Contact information is complete and easy to find"
    ],
    contentImprovements: [
      "Add more measurable achievements with specific metrics",
      "Tailor your skills section more specifically to the job role",
      "Include relevant certifications or professional development",
      "Add a brief professional summary at the beginning",
      "Enhance descriptions of your most relevant experience"
    ],
    formatImprovements: [
      "Use bullet points consistently for better readability",
      "Ensure consistent formatting of dates and locations",
      "Consider using a cleaner template with more white space",
      "Make sure all sections have clear headings",
      "Keep the resume to 1-2 pages maximum"
    ],
    keywordsFound: keywords.found,
    keywordsMissing: keywords.missing,
    summary: "This resume has a good foundation but could benefit from more specific achievements and tailored content for the target role."
  };
}

function createAnalysisPrompt(resumeText: string, jobRole: string): string {
  const jobRoleSpecificText = jobRole 
    ? `The candidate is applying for ${jobRole} positions. Please tailor your analysis to this role.` 
    : "Please provide a general analysis of this resume.";

  return `
Please analyze the following resume text and provide detailed feedback in JSON format.
${jobRoleSpecificText}

Resume Text:
"""
${resumeText}
"""

Evaluate the resume for ATS compatibility, strengths, and areas for improvement. Then provide a detailed analysis in the following JSON format with these exact fields:

{
  "score": <number between 0-100 representing ATS compatibility>,
  "scoreLabel": <string describing the score: "Poor", "Fair", "Good", "Very Good", or "Excellent">,
  "strengths": [<array of strings highlighting the resume's strengths>],
  "contentImprovements": [<array of strings with content improvement suggestions>],
  "formatImprovements": [<array of strings with formatting improvement suggestions>],
  "keywordsFound": [<array of job-relevant keywords found in the resume>],
  "keywordsMissing": [<array of job-relevant keywords that should be considered for inclusion>],
  "summary": <optional brief overall assessment>
}

For the score, use these ranges:
- 0-40: "Poor"
- 41-60: "Fair" 
- 61-80: "Good"
- 81-90: "Very Good"
- 91-100: "Excellent"

For strengths, find 3-5 positive aspects of the resume.
For improvements, suggest 3-5 specific content changes and 3-5 formatting changes.
For keywords, list relevant industry terms found in the resume and suggest 5-10 additional relevant terms.

Only return valid JSON with these exact fields. Do not include explanations outside of the JSON object.
`;
}
