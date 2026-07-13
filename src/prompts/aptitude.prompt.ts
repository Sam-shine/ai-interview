import type { InterviewBlueprint } from "@/src/types";

export function getAptitudePrompt(blueprint: InterviewBlueprint): string {
  return `You are an expert aptitude assessor. Generate exactly 10 aptitude and reasoning questions for an Online Assessment (OA).

Candidate Context:
- Target Role: ${blueprint.role}
- Suggested Difficulty: ${blueprint.suggestedDifficulty}

Categories to include:
1. Logical Reasoning (e.g. pattern recognition, logical deduction, syllogisms, coding-decoding)
2. Numerical Ability (e.g. arithmetic progression, probability, time and work, speed and distance, permutation and combination)
3. Verbal Ability (e.g. reading comprehension, vocabulary, analogy, sentence correction)
4. Analytical Reasoning (e.g. data sufficiency, puzzle-based deduction)

Requirements for each question:
- Exactly 4 options.
- Only one correct answer (must match one of the options exactly).
- Clear, step-by-step mathematical or logical explanation.
- Category (one of: "Logical Reasoning", "Numerical Ability", "Verbal Ability", "Analytical Reasoning").
- Difficulty ("Easy", "Medium", "Hard") tailored to the candidate's level.

Return the output as a valid JSON array matching this TypeScript interface:
\`\`\`ts
interface AptitudeQuestion {
  id: string; // unique random short ID
  question: string;
  options: string[]; // array of 4 options
  correctAnswer: string; // must exactly match one of options
  explanation: string;
  category: "Logical Reasoning" | "Numerical Ability" | "Verbal Ability" | "Analytical Reasoning";
  difficulty: "Easy" | "Medium" | "Hard";
}
\`\`\`

Ensure the JSON is perfectly formatted, containing exactly 10 questions. Do not wrap the JSON in markdown code blocks. Return raw JSON only.`;
}
