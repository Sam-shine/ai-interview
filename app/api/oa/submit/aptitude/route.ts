import { NextResponse } from "next/server";
import { dbService } from "@/src/services/db.service";
import { evaluationService } from "@/src/services/evaluation.service";
import { reportService } from "@/src/services/report.service";
import type { InterviewSession } from "@/src/types";

export async function POST(req: Request) {
  try {
    const { sessionId, answers, violations } = await req.json();

    if (!sessionId || !answers) {
      return NextResponse.json(
        { error: "sessionId and answers are required fields." },
        { status: 400 }
      );
    }

    const session = await dbService.getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found." },
        { status: 404 }
      );
    }

    // Append violations
    const existingViolations = session.violations || [];
    const newViolations = violations || [];
    const combinedViolations = [...existingViolations, ...newViolations];

    // Create intermediate session object to evaluate
    const intermediateSession: InterviewSession = {
      ...session,
      aptitudeAnswers: answers,
      violations: combinedViolations,
      aptitudeStatus: "completed",
    };

    // 1. Run Evaluation Engine
    const evaluation = await evaluationService.evaluateSession(intermediateSession);
    intermediateSession.evaluation = evaluation;

    // 2. Save session with evaluation
    await dbService.saveSession(intermediateSession);

    // 3. Generate Assessment Report (updates & saves session internally)
    const report = await reportService.generateAndSaveReport(intermediateSession);

    return NextResponse.json({
      success: true,
      passed: evaluation.passed,
      overallScore: evaluation.overallScore,
      report,
    });
  } catch (err: any) {
    console.error("Error submitting aptitude round:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process aptitude submission and evaluation." },
      { status: 500 }
    );
  }
}
