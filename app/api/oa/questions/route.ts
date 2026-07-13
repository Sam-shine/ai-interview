import { NextResponse } from "next/server";
import { dbService } from "@/src/services/db.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required." },
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

    // Omit correct answers and explanations
    const cleanMCQs = (session.mcqQuestions || []).map(
      ({ correctAnswer, explanation, ...rest }) => rest
    );
    const cleanAptitude = (session.aptitudeQuestions || []).map(
      ({ correctAnswer, explanation, ...rest }) => rest
    );

    return NextResponse.json({
      mcqQuestions: cleanMCQs,
      codingQuestions: session.codingQuestions || [],
      aptitudeQuestions: cleanAptitude,
    });
  } catch (err: any) {
    console.error("Error fetching questions:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch questions." },
      { status: 500 }
    );
  }
}
