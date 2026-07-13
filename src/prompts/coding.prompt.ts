import type { InterviewBlueprint } from "@/src/types";

export function getCodingPrompt(blueprint: InterviewBlueprint): string {
  return `You are an expert technical interviewer. Generate exactly 5 programming challenges for a candidate taking an Online Assessment (OA).

Candidate Context:
- Target Role: ${blueprint.role}
- Experience Level: ${blueprint.experienceLevel} (${blueprint.yearsOfExperience} years of experience)
- Primary Skills: ${blueprint.skills.join(", ")}
- Suggested Difficulty: ${blueprint.suggestedDifficulty}

Question Distribution:
- 2 Easy problems
- 2 Medium problems
- 1 Hard problem

Each problem must be relevant to the candidate's core coding language stack (e.g. JavaScript, Python, Java, C++, TypeScript).

Requirements for each problem:
- Title, Difficulty ("Easy", "Medium", "Hard")
- Problem Statement (Clear, concise explanation of the problem, input constraints, and goals)
- Constraints (Array of constraints, e.g. "1 <= nums.length <= 10^5")
- Input Format and Output Format descriptions
- Examples (Array of at least 2 examples, each having "input", "output", and an optional "explanation")
- Test Cases: Generate exactly 5 test cases for EACH problem:
  - 2 Visible Test Cases (shown to the candidate during execution)
  - 3 Hidden Test Cases (used for final submission check)
  - Each test case must have a clean "input" and "output" string format that is easily parseable.
- Hints (Array of 2-3 helpful suggestions that don't give away the solution directly)

Return the output as a valid JSON array matching this TypeScript interface:
\`\`\`ts
interface CodingQuestion {
  id: string; // unique random short ID
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  problemStatement: string;
  constraints: string[];
  inputFormat: string;
  outputFormat: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  testCases: {
    input: string;
    output: string;
    isHidden: boolean;
  }[];
  hints: string[];
}
\`\`\`

Ensure the JSON is perfectly formatted, containing exactly 5 questions (2 Easy, 2 Medium, 1 Hard). Do not wrap the JSON in markdown code blocks. Return raw JSON only.`;
}
