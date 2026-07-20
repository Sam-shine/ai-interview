import { dbService } from "./db.service";
import type {
  InterviewContext,
  AIInterviewSession,
  AIQuestion,
  AIInterviewReport,
  InterviewBlueprint,
  Project,
} from "../types";

/**
 * Testing mode: no Gemini calls.
 * All questions, evaluations, and reports use local fallbacks.
 */
const USE_FALLBACK_ONLY = true;

function buildFallbackBlueprint(context: InterviewContext): InterviewBlueprint {
  const candidateName = context.resume?.name || "Candidate";
  const role = context.role || "Full Stack Developer";
  const skills =
    context.resume?.skills ||
    context.jd?.requiredSkills ||
    ["JavaScript", "TypeScript", "React", "Node.js", "MongoDB"];
  const frameworks = context.jd?.preferredSkills || ["React", "Express", "Next.js"];
  const databases = ["MongoDB", "PostgreSQL"];
  const experienceLevel: InterviewBlueprint["experienceLevel"] =
    context.jd?.experience?.includes("5") || (context.resume?.skills?.length ?? 0) > 8
      ? "Mid"
      : "Junior";

  const projects: Project[] =
    context.resume?.projects?.map((p) => ({
      title: p.split("(")[0].trim(),
      description: p,
      technologies: skills.slice(0, 3),
    })) || [
      {
        title: "E-Commerce System",
        description: "A scalable shopping platform built with React and Node.",
        technologies: ["React", "Node.js", "MongoDB"],
      },
    ];

  return {
    candidateName,
    source: context.source,
    role,
    experienceLevel,
    yearsOfExperience: experienceLevel === "Mid" ? 4 : 2,
    skills,
    frameworks,
    databases,
    projects,
    confidenceScore: 85,
    suggestedDifficulty: "Medium",
    estimatedCompanyLevel: "Product",
  };
}

const FALLBACK_QUESTIONS = [
  (role: string, skill: string) =>
    `Hello! Welcome to your technical interview for the ${role} position. To kick things off, can you explain the difference between let, const, and var in JavaScript, and when you would prefer one over the others?`,
  (_role: string, skill: string) =>
    `Great. Let's talk about ${skill}. Can you walk me through how you would design a reusable component or module using ${skill} in a production application?`,
  () =>
    `How do you handle asynchronous operations in JavaScript? Please compare callbacks, promises, and async/await with a practical example.`,
  (_role: string, skill: string) =>
    `Tell me about a challenging bug you faced while working with ${skill}. How did you diagnose and resolve it?`,
  () =>
    `Explain the difference between SQL and NoSQL databases. When would you choose MongoDB over PostgreSQL, or vice versa?`,
  () =>
    `How would you optimize the performance of a slow React application? Mention specific techniques you have used.`,
  () =>
    `Describe how authentication and authorization typically work in a Node.js / Express API. What security practices do you follow?`,
  () =>
    `Walk me through how you would design a REST API for a job board. Which endpoints would you create and why?`,
  () =>
    `Tell me about a project you are proud of. What was your role, the tech stack, and the hardest technical decision you made?`,
  () =>
    `Finally, how do you stay up to date with new technologies, and what would you want to learn next in your career?`,
];

function getFallbackQuestionText(
  index: number,
  blueprint: InterviewBlueprint
): string {
  const role = blueprint.role || "Software Engineer";
  const skill = blueprint.skills[index % blueprint.skills.length] || "React";
  const factory = FALLBACK_QUESTIONS[Math.min(index, FALLBACK_QUESTIONS.length - 1)];
  return factory(role, skill);
}

function evaluateAnswerFallback(answerText: string) {
  const length = answerText.trim().length;
  let score = 50;
  let rating = 5;
  let feedback = "The answer was brief and lacked specific technical details.";

  if (length > 100) {
    score = 80;
    rating = 8;
    feedback =
      "Good response with relevant terminology, demonstrating clear conceptual knowledge.";
  } else if (length > 40) {
    score = 70;
    rating = 7;
    feedback =
      "Clear communication, though further depth in real-world optimizations would be beneficial.";
  }

  return {
    technicalAccuracy: rating,
    communication: Math.min(10, rating + 1),
    problemSolving: rating,
    confidence: Math.min(10, rating + 1),
    completeness: rating,
    practicalKnowledge: rating,
    feedback,
    score,
  };
}

function buildFallbackReport(session: AIInterviewSession): AIInterviewReport {
  const evalData = session.evaluation || {
    overallScore: 0,
    technicalScore: 0,
    communicationScore: 0,
    problemSolvingScore: 0,
    confidenceScore: 0,
    passed: false,
  };
  const durationMins = Math.max(
    1,
    Math.round((Date.now() - new Date(session.createdAt).getTime()) / 60000)
  );

  const qFeedback = session.questions.map((q) => ({
    question: q.questionText,
    answer: q.answerText || "(Skipped)",
    score: q.evaluation?.score || 0,
    feedback: q.evaluation?.feedback || "",
    metrics: {
      accuracy: q.evaluation?.technicalAccuracy || 0,
      communication: q.evaluation?.communication || 0,
      problemSolving: q.evaluation?.problemSolving || 0,
      confidence: q.evaluation?.confidence || 0,
    },
  }));

  const tabSwitches = session.violations.filter((v) => v.type === "tab_switch").length;
  const fullscreenExits = session.violations.filter((v) => v.type === "fullscreen_exit").length;
  const screenShareInterruptions = session.violations.filter(
    (v) => v.type === "screen_share_interrupted"
  ).length;

  const transcriptLogs = session.questions.flatMap((q, idx) => [
    { speaker: "AI" as const, text: q.questionText, timestamp: `${idx * 2}:00` },
    {
      speaker: "Candidate" as const,
      text: q.answerText || "(Skipped)",
      timestamp: `${idx * 2 + 1}:15`,
    },
  ]);

  return {
    candidateSummary: {
      overallScore: evalData.overallScore,
      technicalScore: evalData.technicalScore,
      communicationScore: evalData.communicationScore,
      problemSolvingScore: evalData.problemSolvingScore,
      confidenceScore: evalData.confidenceScore,
      duration: `${durationMins}:00`,
    },
    questionFeedback: qFeedback,
    strengths: [
      "Demonstrated conceptual knowledge in key software engineering practices.",
      "Communicated answers in a structured way.",
      "Kept a steady tone during technical explanations.",
    ],
    weaknesses: [
      "Could elaborate further on edge cases and trade-offs.",
      "Some answers could include more production-level detail.",
    ],
    recommendations: [
      "Practice explaining system design trade-offs out loud.",
      "Add more concrete examples from past projects.",
      "Review performance profiling and debugging techniques.",
    ],
    transcript: transcriptLogs,
    timeline: [
      { timestamp: "00:00", label: "Introduction" },
      { timestamp: "02:00", label: "Core Technical Concepts" },
      { timestamp: "06:00", label: "Project Architecture" },
      { timestamp: "12:00", label: "Behavioral & Scenarios" },
      { timestamp: `${durationMins}:00`, label: "Interview Completed" },
    ],
    proctoringSummary: {
      tabSwitches,
      fullscreenExits,
      screenShareInterruptions,
      status: tabSwitches > 3 ? "Suspicious" : tabSwitches > 0 ? "Flagged" : "Clean",
    },
  };
}

export const aiInterviewService = {
  async startSession(userId: string, context: InterviewContext): Promise<AIInterviewSession> {
    const sessionId = "ai-session-" + Math.random().toString(36).substring(2, 11);

    // Testing: always use local blueprint (no Gemini)
    const blueprint = buildFallbackBlueprint(context);
    void USE_FALLBACK_ONLY;

    const firstQuestion: AIQuestion = {
      id: "q-1",
      questionText: getFallbackQuestionText(0, blueprint),
      evaluation: null,
    };

    const session: AIInterviewSession = {
      id: sessionId,
      userId,
      blueprint,
      status: "in_progress",
      currentQuestionIndex: 0,
      questions: [firstQuestion],
      violations: [],
      timeline: [
        {
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          label: "Introduction",
        },
      ],
      evaluation: null,
      report: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await dbService.saveAISession(session);
    return session;
  },

  finalizeSession(session: AIInterviewSession): AIInterviewSession {
    // Drop any unanswered trailing question so the report only covers answered ones
    session.questions = session.questions.filter(
      (q) => q.answerText != null || q.evaluation != null
    );

    if (session.questions.length === 0) {
      session.status = "completed";
      session.evaluation = {
        overallScore: 0,
        technicalScore: 0,
        communicationScore: 0,
        problemSolvingScore: 0,
        confidenceScore: 0,
        passed: false,
      };
      session.report = buildFallbackReport(session);
      session.timeline = session.report.timeline;
      return session;
    }

    let sumOverall = 0;
    let sumTech = 0;
    let sumComm = 0;
    let sumSolve = 0;
    let sumConf = 0;
    let scored = 0;

    session.questions.forEach((q) => {
      if (q.evaluation) {
        scored += 1;
        sumOverall += q.evaluation.score;
        sumTech += q.evaluation.technicalAccuracy;
        sumComm += q.evaluation.communication;
        sumSolve += q.evaluation.problemSolving;
        sumConf += q.evaluation.confidence;
      }
    });

    const count = Math.max(scored, 1);
    session.status = "completed";
    session.evaluation = {
      overallScore: Math.round(sumOverall / count),
      technicalScore: Math.round((sumTech / count) * 10),
      communicationScore: Math.round((sumComm / count) * 10),
      problemSolvingScore: Math.round((sumSolve / count) * 10),
      confidenceScore: Math.round((sumConf / count) * 10),
      passed: sumOverall / count >= 50,
    };

    const finalReport = buildFallbackReport(session);
    session.report = finalReport;
    session.timeline = finalReport.timeline || session.timeline;
    return session;
  },

  async submitAnswer(
    sessionId: string,
    questionId: string,
    answerText: string,
    violations: { type: string; timestamp: string }[] = [],
    endInterview = false
  ): Promise<AIInterviewSession> {
    const session = await dbService.getAISession(sessionId);
    if (!session) {
      throw new Error("AI Interview Session not found.");
    }

    const currentQuestionIndex = session.questions.findIndex((q) => q.id === questionId);
    if (currentQuestionIndex === -1) {
      throw new Error("Question not found in this session.");
    }

    session.questions[currentQuestionIndex].answerText = answerText || "(Skipped)";

    if (violations && violations.length > 0) {
      session.violations = [...session.violations, ...violations];
    }

    // Testing: local evaluation only (no Gemini)
    session.questions[currentQuestionIndex].evaluation = evaluateAnswerFallback(
      answerText || ""
    );

    const totalQuestionsAsked = session.questions.length;
    const shouldComplete = endInterview || totalQuestionsAsked >= 10;

    if (shouldComplete) {
      this.finalizeSession(session);
    } else {
      const nextQuestion: AIQuestion = {
        id: `q-${totalQuestionsAsked + 1}`,
        questionText: getFallbackQuestionText(totalQuestionsAsked, session.blueprint),
        evaluation: null,
      };

      session.questions.push(nextQuestion);
      session.currentQuestionIndex = totalQuestionsAsked;

      if (totalQuestionsAsked === 3) {
        session.timeline.push({
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          label: "Core Technical Concepts",
        });
      } else if (totalQuestionsAsked === 6) {
        session.timeline.push({
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          label: "Project Architecture",
        });
      } else if (totalQuestionsAsked === 8) {
        session.timeline.push({
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          label: "Behavioral & Scenarios",
        });
      }
    }

    session.updatedAt = new Date().toISOString();
    await dbService.saveAISession(session);
    return session;
  },
};
