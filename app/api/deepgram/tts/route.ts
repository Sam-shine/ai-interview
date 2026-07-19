import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Deepgram API key not configured." },
        { status: 400 }
      );
    }

    const { text, voice } = await req.json();
    if (!text) {
      return NextResponse.json(
        { error: "Text is required." },
        { status: 400 }
      );
    }

    // Default voice model: female English
    const voiceModel = voice || "aura-asteria-en";

    const res = await fetch(`https://api.deepgram.com/v1/speak?model=${voiceModel}`, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      throw new Error(`Deepgram TTS failed: ${res.statusText}`);
    }

    const audioBuffer = await res.arrayBuffer();
    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mp3",
      },
    });
  } catch (err: any) {
    console.error("Error in Deepgram TTS Route:", err);
    return NextResponse.json(
      { error: err.message || "TTS generation failed." },
      { status: 500 }
    );
  }
}
