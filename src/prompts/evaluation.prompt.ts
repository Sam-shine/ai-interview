import type { CodingQuestion } from "@/src/types";

export function getCodeEvaluationPrompt(
  question: CodingQuestion,
  code: string,
  language: string,
  testCaseResults: { passed: number; total: number; compilerOutput?: string }
): string {
  return `You are a Senior Principal Software Engineer conducting a code review. Analyze the candidate's coding submission.

Problem Details:
- Title: ${question.title}
- Description: ${question.problemStatement}
- Difficulty: ${question.difficulty}

Submission Details:
- Programming Language: ${language}
- Candidate Code:
\`\`\`${language}
${code}
\`\`\`
- Compilation/Test Run Results: ${testCaseResults.passed} / ${testCaseResults.total} test cases passed.
- Compiler/Stdout Output: ${testCaseResults.compilerOutput || "None"}

Perform a detailed code analysis. Evaluate:
1. Logic: Is the logic correct? Does it handle edge cases?
2. Readability: Is the naming clean, layout structured, and comments appropriate?
3. Optimization: Is the space/time complexity optimal?
4. Complexity: Estimate the Time Complexity (Big O) and Space Complexity (Big O) of the candidate's code.
5. Suggestions: Detail 2-3 specific improvements or alternative approaches.

Return the output as a valid JSON object matching this TypeScript interface:
\`\`\`ts
interface CodeAnalysis {
  complexity: string; // e.g. "Time: O(N log N), Space: O(N)"
  codeQuality: string; // e.g. "Good structure, but could use better variable naming."
  optimization: string; // e.g. "Use a hash map to reduce time complexity to O(N)."
  suggestions: string; // Bulleted suggestions or code snippets for improvement
}
\`\`\`

Ensure the JSON is perfectly formatted. Do not wrap in markdown code blocks. Return raw JSON only.`;
}
