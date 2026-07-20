import { NextResponse } from "next/server";

/**
 * Return Deepgram API key for browser WebSocket auth.
 * Uses the master key directly for reliable live STT during testing.
 */
export async function GET() {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Deepgram API key not configured." },
        { status: 400 }
      );
    }

    return NextResponse.json({ token: apiKey });
  } catch (err: any) {
    console.error("Error generating Deepgram token:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate token." },
      { status: 500 }
    );
  }
}
