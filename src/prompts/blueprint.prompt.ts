import type { InterviewContext } from "@/src/types";

export function getBlueprintPrompt(context: InterviewContext): string {
  const sourceText = context.source === "resume" 
    ? `Resume Data: Name: ${context.resume?.name}, Skills: ${context.resume?.skills.join(", ")}, Projects: ${context.resume?.projects.join("; ")}, Education: ${context.resume?.education}`
    : context.source === "jd"
      ? `Job Description Data: Company: ${context.jd?.company}, Experience: ${context.jd?.experience}, Required Skills: ${context.jd?.requiredSkills.join(", ")}, Preferred Skills: ${context.jd?.preferredSkills.join(", ")}`
      : `Selected Target Role: ${context.role}`;

  return `You are an expert talent acquisition system. Parse the following candidate profile source context and generate a structured Interview Blueprint.

Source Context (${context.source}):
${sourceText}

Generate a structured Interview Blueprint that compiles candidate details, lists extracted skills, suggests estimated difficulties, and determines candidate profile characteristics.

Requirements:
- candidateName: Name of the candidate (default to "Candidate" or role-based default if not in resume)
- source: must be "${context.source}"
- role: Job title / role being interviewed for
- experienceLevel: One of "Fresher", "Junior", "Mid", "Senior"
- yearsOfExperience: Estimated years of experience (parse from text or default to 0 for Fresher, 2 for Junior, 5 for Mid, 8+ for Senior)
- skills: Array of core technical languages and skills (e.g. JavaScript, Python, SQL)
- frameworks: Array of frameworks (e.g. React, Express, Django)
- databases: Array of databases (e.g. PostgreSQL, MongoDB, Redis)
- projects: Array of projects with title, description, and technologies used
- confidenceScore: Percentage score (0-100) reflecting the richness of parsed information
- suggestedDifficulty: Suggested assessment difficulty ("Easy", "Medium", "Hard")
- estimatedCompanyLevel: Target company tier tier classification ("Startup", "Product", "FAANG")

Return the output as a valid JSON object matching this TypeScript interface:
\`\`\`ts
interface Project {
  title: string;
  description: string;
  technologies: string[];
}

interface InterviewBlueprint {
  candidateName: string;
  source: "resume" | "jd" | "role";
  role: string;
  experienceLevel: "Fresher" | "Junior" | "Mid" | "Senior";
  yearsOfExperience: number;
  skills: string[];
  frameworks: string[];
  databases: string[];
  projects: Project[];
  confidenceScore: number;
  suggestedDifficulty: "Easy" | "Medium" | "Hard";
  estimatedCompanyLevel: "Startup" | "Product" | "FAANG";
}
\`\`\`

Ensure the JSON is perfectly formatted. Do not wrap in markdown code blocks. Return raw JSON only.`;
}
