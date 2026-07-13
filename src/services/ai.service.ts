import { GeminiProvider } from "./gemini.provider";
import type { AIProvider } from "./ai-provider.interface";

// Singleton active provider based on environment variables
const selectedProviderType = process.env.NEXT_PUBLIC_AI_PROVIDER || "gemini";

let activeProvider: AIProvider;

if (selectedProviderType === "gemini") {
  activeProvider = new GeminiProvider();
} else {
  // Default to Gemini as the active provider
  activeProvider = new GeminiProvider();
}

export const aiService = activeProvider;
export type { AIProvider };
