import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Deepgram API key not configured." },
        { status: 400 }
      );
    }

    try {
      // 1. Fetch Projects
      const projectsRes = await fetch("https://api.deepgram.com/v1/projects", {
        headers: { Authorization: `Token ${apiKey}` },
      });
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        if (projectsData.projects && projectsData.projects.length > 0) {
          const projectId = projectsData.projects[0].project_id;

          // 2. Create a temporary key (valid for 60 seconds)
          const keyRes = await fetch(`https://api.deepgram.com/v1/projects/${projectId}/keys`, {
            method: "POST",
            headers: {
              Authorization: `Token ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              comment: "Temporary client key for Next.js",
              scopes: ["usage:write"],
              time_to_live_in_seconds: 60,
            }),
          });

          if (keyRes.ok) {
            const keyData = await keyRes.json();
            if (keyData.key) {
              return NextResponse.json({
                token: keyData.key,
              });
            }
          }
        }
      }
    } catch (innerErr) {
      console.warn("Failed to generate temporary Deepgram key, falling back to master key:", innerErr);
    }

    // Fallback: Return the configured master API key directly
    return NextResponse.json({
      token: apiKey,
    });
  } catch (err: any) {
    console.error("Error generating Deepgram token:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate token." },
      { status: 500 }
    );
  }
}
