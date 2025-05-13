import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set page title and meta description for SEO
document.title = "ResumeAI - Smart Resume Analysis with GPT-4";
const metaDescription = document.createElement("meta");
metaDescription.name = "description";
metaDescription.content = "Upload your resume for AI-powered analysis and get personalized feedback to improve your chances of passing ATS systems and landing your dream job.";
document.head.appendChild(metaDescription);

createRoot(document.getElementById("root")!).render(<App />);
