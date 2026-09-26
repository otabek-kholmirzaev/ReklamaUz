import { creators } from "@/lib/data";

export type ChatHistoryMessage = {
  role: "assistant" | "user";
  content: string;
};

export type CopilotResult = {
  message: string;
  responseId: string;
  model: string;
  recommendations: string[];
};

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001").replace(/\/$/, "");

const creatorCatalog = creators.map((creator) => ({
  username: creator.username,
  name: creator.name,
  category: creator.category,
  tags: creator.tags,
  platforms: creator.platforms,
  followers: creator.followers,
  minimumPrice: Math.min(...creator.services.map((service) => service.price)),
}));

export async function askCopilot(message: string, history: ChatHistoryMessage[]): Promise<CopilotResult> {
  const response = await fetch(`${apiBaseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history: history.slice(-20), creators: creatorCatalog }),
  });
  const payload = (await response.json().catch(() => null)) as CopilotResult | { error?: string } | null;

  if (!response.ok || !payload || !("message" in payload)) {
    throw new Error(payload && "error" in payload && payload.error ? payload.error : "Copilot could not respond right now.");
  }

  return payload;
}
