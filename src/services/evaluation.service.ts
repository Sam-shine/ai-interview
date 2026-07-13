import type { InterviewSession, OAEvaluation } from "@/src/types";

export class EvaluationService {
  async evaluateSession(session: InterviewSession): Promise<OAEvaluation> {
    // 1. Evaluate MCQs
    let mcqCorrect = 0;
    let mcqWrong = 0;
    let mcqSkipped = 0;

    session.mcqQuestions.forEach((q) => {
      const ans = session.mcqAnswers[q.id];
      if (!ans) {
        mcqSkipped++;
      } else if (ans.trim() === q.correctAnswer.trim()) {
        mcqCorrect++;
      } else {
        mcqWrong++;
      }
    });

    const mcqTotal = session.mcqQuestions.length || 1;
    const mcqAccuracy = mcqTotal > mcqSkipped ? Math.round((mcqCorrect / (mcqTotal - mcqSkipped)) * 100) : 0;
    const mcqScore = Math.round((mcqCorrect / mcqTotal) * 100);

    // 2. Evaluate Coding
    let totalCodingCases = 0;
    let passedCodingCases = 0;
    let attemptedProblemsCount = 0;

    session.codingQuestions.forEach((q) => {
      const submission = session.codingAnswers[q.id];
      if (submission) {
        attemptedProblemsCount++;
        passedCodingCases += submission.passedCount || 0;
        totalCodingCases += submission.totalCount || q.testCases.length;
      } else {
        totalCodingCases += q.testCases.length;
      }
    });

    if (totalCodingCases === 0) totalCodingCases = 1;
    const codingScore = Math.round((passedCodingCases / totalCodingCases) * 100);

    // 3. Evaluate Aptitude
    let aptCorrect = 0;
    let aptWrong = 0;
    let aptSkipped = 0;

    session.aptitudeQuestions.forEach((q) => {
      const ans = session.aptitudeAnswers[q.id];
      if (!ans) {
        aptSkipped++;
      } else if (ans.trim() === q.correctAnswer.trim()) {
        aptCorrect++;
      } else {
        aptWrong++;
      }
    });

    const aptTotal = session.aptitudeQuestions.length || 1;
    const aptAccuracy = aptTotal > aptSkipped ? Math.round((aptCorrect / (aptTotal - aptSkipped)) * 100) : 0;
    const aptitudeScore = Math.round((aptCorrect / aptTotal) * 100);

    // 4. Calculate Weighted Score
    // MCQ: 30%, Coding: 50%, Aptitude: 20%
    const overallScore = Math.round(
      mcqScore * 0.3 + codingScore * 0.5 + aptitudeScore * 0.2
    );

    const passed = overallScore >= 50;

    // Calculate accuracy percentage
    const totalAttempted = (mcqTotal - mcqSkipped) + (aptTotal - aptSkipped) + attemptedProblemsCount;
    const totalCorrectAnswers = mcqCorrect + aptCorrect + (passedCodingCases > 0 ? Math.round(passedCodingCases / 5) : 0);
    const accuracy = totalAttempted > 0 ? Math.round((totalCorrectAnswers / totalAttempted) * 100) : 0;

    // Calculate simulated duration (78 mins as placeholder or based on timestamps)
    const timeTaken = 78;

    return {
      mcqScore,
      codingScore,
      aptitudeScore,
      overallScore,
      percentage: overallScore,
      passed,
      timeTaken,
      accuracy,
      mcqStats: {
        correct: mcqCorrect,
        wrong: mcqWrong,
        skipped: mcqSkipped,
        accuracy: mcqAccuracy,
      },
      codingStats: {
        problemsAttempted: attemptedProblemsCount,
        passed: passedCodingCases,
        failed: totalCodingCases - passedCodingCases,
        compilationStatus: passedCodingCases === totalCodingCases ? "Accepted" : "Failed cases",
      },
      aptitudeStats: {
        correct: aptCorrect,
        wrong: aptWrong,
        skipped: aptSkipped,
        accuracy: aptAccuracy,
      },
    };
  }
}

export const evaluationService = new EvaluationService();
