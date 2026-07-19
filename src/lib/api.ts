import { SUPABASE_URL } from "./supabase";
import type { DiagnosisResult, AdvisoryResult, LanguageCode, AlchemystAdvisory, AlchemystThinkingStep, NewsItem } from "./types";

const headers = () => ({
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
});

export async function callDiagnose(params: {
  crop: string;
  symptoms: string[];
  imageColors?: string[];
  imageTextures?: string[];
  imageParts?: string[];
}): Promise<DiagnosisResult> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/diagnose`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Diagnosis failed (${res.status})`);
  }
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data as DiagnosisResult;
}

export async function callAdvisory(params: {
  topic?: string;
  language?: LanguageCode;
  memories?: { type: string; content: string }[];
  farmerProfile?: { name?: string; state?: string; district?: string; crops?: string[] };
}): Promise<AdvisoryResult> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/advisory`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Advisory failed (${res.status})`);
  }
  return (await res.json()) as AdvisoryResult;
}

export async function callVoiceTTS(text: string, language: LanguageCode): Promise<void> {
  await fetch(`${SUPABASE_URL}/functions/v1/voice`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ action: "tts", text, language }),
  });
}

export async function callVoiceSTT(language: LanguageCode): Promise<{ supported: boolean }> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/voice`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ action: "stt", language }),
  });
  if (!res.ok) throw new Error(`Voice check failed (${res.status})`);
  return await res.json();
}

// Mem0 memory operations (requires auth token)
export async function mem0Add(
  token: string,
  memoryType: string,
  content: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/mem0-memory`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ action: "add", memoryType, content, metadata }),
  });
  if (!res.ok) throw new Error("Failed to add memory");
}

export async function mem0List(token: string, limit = 50) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/mem0-memory`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ action: "list", limit }),
  });
  if (!res.ok) throw new Error("Failed to list memories");
  const data = await res.json();
  return data.memories || [];
}

// Keploy test capture (requires auth token)
export async function keployCapture(
  token: string,
  endpoint: string,
  method: string,
  requestBody: unknown,
  responseStatus: number,
  responseBody: unknown,
  testName: string
): Promise<void> {
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/keploy-capture`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "capture",
        endpoint,
        method,
        requestBody,
        responseStatus,
        responseBody,
        testName,
      }),
    });
  } catch {
    // Keploy capture is best-effort - should not block user flow
  }
}

export async function keployList(token: string) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/keploy-capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ action: "list", limit: 50 }),
  });
  if (!res.ok) throw new Error("Failed to list tests");
  const data = await res.json();
  return data.tests || [];
}

// Outlier validation report (requires auth token)
export async function outlierReport(token: string) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/outlier-validate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ action: "report" }),
  });
  if (!res.ok) throw new Error("Failed to get outlier report");
  return await res.json();
}

// Alchemyst AI advisory - streaming with visible thinking steps (SSE)
export async function callAlchemystAdvisoryStream(
  params: {
    topic?: string;
    language?: LanguageCode;
    memories?: { type: string; content: string }[];
    farmerProfile?: { name?: string; state?: string; district?: string; crops?: string[] };
    query?: string;
  },
  onThinking: (step: AlchemystThinkingStep) => void,
  onContext: (chunks: string[]) => void,
  onAdvisory: (text: string) => void,
  onDone: () => void
): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/alchemyst-advisory`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Alchemyst advisory failed (${res.status})`);
  if (!res.body) throw new Error("No response stream");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.type === "thinking") {
            onThinking({ step: data.step, label: data.label, detail: data.detail });
          } else if (data.type === "context") {
            onContext(data.chunks || []);
          } else if (data.type === "advisory") {
            onAdvisory(data.text);
          } else if (data.type === "done") {
            onDone();
          }
        } catch {
          // skip malformed lines
        }
      }
    }
  }
}

// StartupNews.fyi - live agri-tech news
export async function fetchNews(params: {
  category?: string;
  region?: string;
  limit?: number;
}): Promise<NewsItem[]> {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.region) query.set("region", params.region);
  if (params.limit) query.set("limit", String(params.limit));
  const res = await fetch(`${SUPABASE_URL}/functions/v1/startup-news?${query.toString()}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`News fetch failed (${res.status})`);
  const data = await res.json();
  return (data.items || []) as NewsItem[];
}
