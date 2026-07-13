import type { InterviewSession, OAReport } from "@/src/types";
import { aiService } from "./ai.service";
import { dbService } from "./db.service";

export class ReportService {
  async generateAndSaveReport(session: InterviewSession): Promise<OAReport> {
    if (!session.evaluation) {
      throw new Error("Cannot generate assessment report: session is not evaluated yet.");
    }

    // Call AI provider to generate report content
    const report = await aiService.generateReport(session);

    // Save report to session
    const updatedSession: InterviewSession = {
      ...session,
      report,
      updatedAt: new Date().toISOString(),
    };

    await dbService.saveSession(updatedSession);
    return report;
  }
}

export const reportService = new ReportService();
