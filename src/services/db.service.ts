import fs from "fs";
import path from "path";
import type { InterviewSession } from "@/src/types";

// Setup storage path inside project
const DB_DIR = path.join(process.cwd(), "src", "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// In-memory fallback if file system fails
const memoryDb = new Map<string, InterviewSession>();

interface Schema {
  sessions: Record<string, InterviewSession>;
}

function initializeDb() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify({ sessions: {} }, null, 2), "utf8");
    }
  } catch (err) {
    console.warn("DB initialization warning, falling back to memory database:", err);
  }
}

function readData(): Schema {
  initializeDb();
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf8");
      return JSON.parse(content) as Schema;
    }
  } catch (err) {
    console.error("Error reading from db file:", err);
  }
  
  // Return in-memory reconstruction
  const sessionsObj: Record<string, InterviewSession> = {};
  memoryDb.forEach((val, key) => {
    sessionsObj[key] = val;
  });
  return { sessions: sessionsObj };
}

function writeData(data: Schema) {
  initializeDb();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing to db file, syncing to memory instead:", err);
    // Sync to memory
    Object.entries(data.sessions).forEach(([key, val]) => {
      memoryDb.set(key, val);
    });
  }
}

export const dbService = {
  async getSession(sessionId: string): Promise<InterviewSession | null> {
    const data = readData();
    const session = data.sessions[sessionId];
    if (session) return session;
    return memoryDb.get(sessionId) || null;
  },

  async saveSession(session: InterviewSession): Promise<void> {
    const data = readData();
    data.sessions[session.id] = {
      ...session,
      updatedAt: new Date().toISOString()
    };
    writeData(data);
    memoryDb.set(session.id, session);
  },

  async createSession(session: InterviewSession): Promise<void> {
    await this.saveSession(session);
  },

  async deleteSession(sessionId: string): Promise<void> {
    const data = readData();
    delete data.sessions[sessionId];
    writeData(data);
    memoryDb.delete(sessionId);
  },

  async listSessions(userId: string): Promise<InterviewSession[]> {
    const data = readData();
    const dbSessions = Object.values(data.sessions).filter(
      (s) => s.userId === userId
    );
    
    // Merge with memory db items
    const memorySessions = Array.from(memoryDb.values()).filter(
      (s) => s.userId === userId
    );
    
    const combined = [...dbSessions];
    memorySessions.forEach((m) => {
      if (!combined.some((c) => c.id === m.id)) {
        combined.push(m);
      }
    });

    // Sort by updatedAt desc
    return combined.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
};
