import { NextResponse } from "next/server";
import { dbService } from "@/src/services/db.service";
import type { InterviewSession } from "@/src/types";

export async function POST(req: Request) {
  try {
    const { sessionId, answers, violations } = await req.json();

    if (!sessionId || !answers) {
      return NextResponse.json(
        { error: "sessionId and answers are required." },
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

    // Append violations if any
    const existingViolations = session.violations || [];
    const newViolations = violations || [];
    const combinedViolations = [...existingViolations, ...newViolations];

    // Update session
    const updatedSession: InterviewSession = {
      ...session,
      mcqAnswers: answers,
      violations: combinedViolations,
      mcqStatus: "completed",
      codingStatus: "in_progress", // Auto-unlock coding
      updatedAt: new Date().toISOString(),
    };

    await dbService.saveSession(updatedSession);

    return NextResponse.json({ success: true, message: "MCQ answers submitted successfully." });
  } catch (err: any) {
    console.error("Error submitting MCQ answers:", err);
    return NextResponse.json(
      { error: err.message || "Failed to submit MCQ answers." },
      { status: 500 }
    );
  }
}
