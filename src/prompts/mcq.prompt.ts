import type { InterviewBlueprint } from "@/src/types";

export function getMCQPrompt(blueprint: InterviewBlueprint): string {
  return `You are an expert technical interviewer. Generate exactly 15 technical multiple-choice questions (MCQs) for a candidate taking an Online Assessment (OA).

Candidate Context:
- Name: ${blueprint.candidateName}
- Target Role: ${blueprint.role}
- Experience Level: ${blueprint.experienceLevel} (${blueprint.yearsOfExperience} years of experience)
- Skills: ${blueprint.skills.join(", ")}
- Frameworks: ${blueprint.frameworks.join(", ")}
- Databases: ${blueprint.databases.join(", ")}
- Projects: ${JSON.stringify(blueprint.projects)}
- Suggested Difficulty: ${blueprint.suggestedDifficulty}

Question Distribution:
1. Core Skills (40% - 6 questions): Direct testing of core skills/frameworks.
2. Project-Based (30% - 4 questions): Applied questions testing practical knowledge of technologies they used in projects.
3. Conceptual (20% - 3 questions): Testing fundamental concepts, under-the-hood workings, and theoretical knowledge.
4. Scenario-Based (10% - 2 questions): Real-world debugging, architecture decisions, or problem scenarios.

Requirements for each question:
- Exactly 4 options.
- Only one clear correct answer (must match one of the options exactly).
- Detailed explanation explaining why the answer is correct and why the others are wrong.
- Skill tested.
- Difficulty ("Easy", "Medium", "Hard") corresponding to the candidate's level.
- Expected completion time in seconds (between 45 and 90 seconds).

Return the output as a valid JSON array matching this TypeScript interface:
\`\`\`ts
interface MCQQuestion {
  id: string; // unique random short ID
  question: string;
  options: string[]; // array of 4 options
  correctAnswer: string; // must exactly match one of options
  explanation: string;
  skill: string;
  difficulty: "Easy" | "Medium" | "Hard";
  expectedTime: number; // in seconds
}
\`\`\`

Ensure the JSON is perfectly formatted and contains exactly 15 questions. Do not wrap the JSON in markdown code blocks like \`\`\`json. Just return raw JSON.`;
}
