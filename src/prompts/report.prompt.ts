import type { InterviewSession } from "@/src/types";

export function getReportPrompt(session: InterviewSession): string {
  const evalData = session.evaluation!;
  
  return `You are a Principal Technical Recruiter and Career Coach. Generate a comprehensive, professional assessment report for the candidate based on their completed Online Assessment (OA).

Candidate Context:
- Name: ${session.blueprint.candidateName}
- Target Role: ${session.blueprint.role}
- Experience Level: ${session.blueprint.experienceLevel} (${session.blueprint.yearsOfExperience} years of experience)
- Primary Skills: ${session.blueprint.skills.join(", ")}

Assessment Results:
- Overall Score: ${evalData.overallScore}% (Percentage: ${evalData.percentage}%)
- Qualification Result: ${evalData.passed ? "Passed (Qualified for AI Interview Round)" : "Failed (Needs More Practice)"}
- Total Time Taken: ${evalData.timeTaken} minutes
- Total Accuracy: ${evalData.accuracy}%
- Tab/Window Switching Cheating Violations: ${session.violations.length} violations

Round-by-Round Breakdown:
1. Technical MCQ Round:
   - Score: ${evalData.mcqScore}%
   - Correct: ${evalData.mcqStats.correct}, Wrong: ${evalData.mcqStats.wrong}, Skipped: ${evalData.mcqStats.skipped}
   - Accuracy: ${evalData.mcqStats.accuracy}%
2. Coding Round:
   - Score: ${evalData.codingScore}%
   - Problems Attempted: ${evalData.codingStats.problemsAttempted}, Passed: ${evalData.codingStats.passed}, Failed: ${evalData.codingStats.failed}
   - Candidate Coding Answers and Feedback: ${JSON.stringify(session.codingAnswers)}
3. Aptitude Round:
   - Score: ${evalData.aptitudeScore}%
   - Correct: ${evalData.aptitudeStats.correct}, Wrong: ${evalData.aptitudeStats.wrong}, Skipped: ${evalData.aptitudeStats.skipped}
   - Accuracy: ${evalData.aptitudeStats.accuracy}%

Requirements for the Report:
- Generate a clear Candidate Summary.
- Technical Performance: Map out skill-wise percentage scores (e.g. React: 85%, Node: 70%, etc.) based on MCQ/Coding answers.
- Coding Performance: Summarize problems attempted/passed, general code quality review, complexity optimization notes, and suggestions.
- Aptitude Performance breakdown by categories (Logical, Numerical, Verbal, Analytical).
- List Strong Areas (skills/concepts where they showed top performance).
- List Weak Areas (skills/concepts that need revision).
- Personalized Learning Path: A detailed list of recommended topics to learn next (e.g. "Practice Dynamic Programming", "Revise SQL joins").
- Interview Readiness: Determine one of "Ready for Junior Roles", "Ready for Mid-Level Roles", "Needs More Practice".
- Final Recommendation: Determine one of "Proceed to AI Interview" (if overallScore >= 50) or "Retry OA Assessment" (if overallScore < 50).

Return the output as a valid JSON object matching this TypeScript interface:
\`\`\`ts
interface OAReport {
  candidateSummary: {
    name: string;
    role: string;
    experience: string;
    difficulty: string;
    duration: string;
    overallScore: number;
  };
  technicalPerformance: Record<string, number>; // e.g. {"React": 85, "Node": 78}
  codingPerformance: {
    problemsAttempted: number;
    passed: number;
    failed: number;
    codeQuality: string;
    optimization: string;
    suggestions: string;
  };
  aptitudePerformance: {
    logical: number; // percentage
    numerical: number; // percentage
    verbal: number; // percentage
    analytical: number; // percentage
  };
  strongAreas: string[];
  weakAreas: string[];
  personalizedLearningPath: string[];
  interviewReadiness: "Ready for Junior Roles" | "Ready for Mid-Level Roles" | "Needs More Practice";
  finalRecommendation: "Proceed to AI Interview" | "Retry OA Assessment";
}
\`\`\`

Ensure the JSON is perfectly formatted. Do not wrap in markdown code blocks. Return raw JSON only.`;
}
