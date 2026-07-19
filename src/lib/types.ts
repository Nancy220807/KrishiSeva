export type LanguageCode = "en" | "hi" | "mr" | "ta" | "te" | "bn" | "kn";

export interface LanguageOption {
  label: string;
  code: LanguageCode;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { label: "English", code: "en" },
  { label: "हिन्दी (Hindi)", code: "hi" },
  { label: "मराठी (Marathi)", code: "mr" },
  { label: "தமிழ் (Tamil)", code: "ta" },
  { label: "తెలుగు (Telugu)", code: "te" },
  { label: "বাংলা (Bengali)", code: "bn" },
  { label: "ಕನ್ನಡ (Kannada)", code: "kn" },
];

export interface Profile {
  id: string;
  full_name: string;
  preferred_language: LanguageCode;
  state: string | null;
  district: string | null;
  primary_crops: string[];
  farm_size_acres: number | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Diagnosis {
  id: string;
  user_id: string;
  crop_name: string;
  disease_name: string;
  confidence_score: number;
  severity: "low" | "medium" | "high";
  symptoms: string | null;
  treatment: string | null;
  prevention: string | null;
  image_url: string | null;
  language: string;
  outlier_warning: boolean;
  outlier_notes: string | null;
  created_at: string;
}

export interface Memory {
  id: string;
  user_id: string;
  memory_type: string;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  diagnosis_id: string | null;
  rating: number | null;
  was_helpful: boolean | null;
  comment: string | null;
  created_at: string;
}

export interface ApiTest {
  id: string;
  user_id: string | null;
  endpoint: string;
  method: string;
  request_body: unknown;
  response_status: number;
  response_body: unknown;
  test_name: string;
  created_at: string;
}

export interface DiagnosisResult {
  crop: string;
  disease: string;
  confidence: number;
  severity: "low" | "medium" | "high";
  symptoms: { en: string; hi: string };
  treatment: { en: string; hi: string };
  prevention: { en: string; hi: string };
  outlier_warning: boolean;
  outlier_notes: string;
  matched_symptoms: number;
  total_symptoms: number;
}

export interface AdvisoryResult {
  language: string;
  topic: string;
  title: string;
  greeting: string;
  memoryContext: string[];
  recommendations: string[];
  closing: string;
  generatedAt: string;
  mem0Enabled: boolean;
}

export interface AlchemystThinkingStep {
  step: string;
  label: string;
  detail: string;
}

export interface AlchemystAdvisory {
  thinkingSteps: AlchemystThinkingStep[];
  retrievedContext: string[];
  advisory: string[];
  source: string;
  language: string;
  topic: string;
  alchemystEnabled: boolean;
}

export interface NewsItem {
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  category: "news" | "pest-alert" | "govt-scheme";
  region?: string;
}

export interface NewsResult {
  items: NewsItem[];
  provider: string;
  fetchedAt: string;
}

export interface PartnerInfo {
  name: string;
  role: string;
  description: string;
  color: string;
  integration: string;
}

export const PARTNERS: PartnerInfo[] = [
  {
    name: "Gnani.ai",
    role: "Voice AI (STT + TTS)",
    description: "Indian-language voice input and output with native Indic pronunciation. Farmers can speak instead of type.",
    color: "#2563eb",
    integration: "Voice input on diagnosis page, voice output on advisory page",
  },
  {
    name: "Mem0",
    role: "Persistent Farmer Memory",
    description: "Remembers past diagnoses, crops, and feedback across sessions. Turns KrishiSeva into a personalized AI agent.",
    color: "#059669",
    integration: "Memory context in advisory generation, memory dashboard panel",
  },
  {
    name: "Keploy",
    role: "API Test Generation",
    description: "Zero-code test capture and replay from real traffic. Proves backend reliability with auto-generated test cases.",
    color: "#d97706",
    integration: "Captures every API call as a replayable test case, viewable in dashboard",
  },
  {
    name: "Outlier",
    role: "Advisory Quality Validation",
    description: "Statistical confidence checks before showing results. Flags suspicious predictions with warnings.",
    color: "#dc2626",
    integration: "Validation layer in diagnose function, outlier report on dashboard",
  },
  {
    name: "Alchemyst AI",
    role: "Context-Enriched LLM Advisory",
    description: "RAG over farming knowledge base with streaming advisory generation. Shows visible thinking steps so farmers see the reasoning behind each recommendation.",
    color: "#7c3aed",
    integration: "Powers the enhanced advisory engine with RAG retrieval and step-by-step reasoning",
  },
  {
    name: "StartupNews.fyi",
    role: "Live Agri-Tech News & Alerts",
    description: "RSS feed filtered for agriculture keywords with regional pest outbreak alerts and government scheme notifications in a live sidebar.",
    color: "#0891b2",
    integration: "Live news sidebar on every page, regional alerts on dashboard",
  },
];

export const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Gujarat", "Haryana",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh",
  "Uttarakhand", "West Bengal",
];

export const COMMON_CROPS = [
  "Rice", "Wheat", "Tomato", "Cotton", "Maize", "Potato",
  "Groundnut", "Sugarcane", "Chilli", "Onion", "Soybean", "Mustard",
];

export const COMMON_SYMPTOMS = [
  "yellow leaves", "brown spots", "white powder", "leaf curl", "rot",
  "wilt", "stunted growth", "discoloration", "lesions", "pustules",
  "holes in leaves", "fruit damage", "stem rot", "root damage",
];
