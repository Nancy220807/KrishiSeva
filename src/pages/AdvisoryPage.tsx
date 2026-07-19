import { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { callAdvisory, callAlchemystAdvisoryStream, mem0List, keployCapture } from "../lib/api";
import type { AdvisoryResult, Memory, AlchemystThinkingStep } from "../lib/types";
import {
  MessageSquare, Volume2, Square, Brain, Send, Droplets,
  Bug, Sprout, Wheat, Leaf, RefreshCw, Sparkles, Search, CheckCircle, Loader2,
} from "lucide-react";
import { Mem0Logo, GnaniLogo, AlchemystLogo } from "../components/PartnerLogos";
import { NewsSidebar } from "../components/NewsSidebar";

const TOPICS = [
  { id: "general", icon: Leaf },
  { id: "irrigation", icon: Droplets },
  { id: "pest", icon: Bug },
  { id: "fertilizer", icon: Sprout },
  { id: "harvesting", icon: Wheat },
];

export function AdvisoryPage() {
  const { session, profile } = useAuth();
  const { language, t } = useLanguage();
  const [selectedTopic, setSelectedTopic] = useState("general");
  const [advisory, setAdvisory] = useState<AdvisoryResult | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [question, setQuestion] = useState("");
  const [alchemystMode, setAlchemystMode] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<AlchemystThinkingStep[]>([]);
  const [retrievedContext, setRetrievedContext] = useState<string[]>([]);
  const [alchemystAdvisory, setAlchemystAdvisory] = useState<string[]>([]);
  const [streaming, setStreaming] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    async function loadMemories() {
      if (!session?.access_token) return;
      try {
        const mems = await mem0List(session.access_token, 10);
        setMemories(mems as Memory[]);
      } catch {
        // ignore
      }
    }
    loadMemories();
  }, [session]);

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setAdvisory(null);
    setThinkingSteps([]);
    setRetrievedContext([]);
    setAlchemystAdvisory([]);

    if (alchemystMode) {
      await handleAlchemystGenerate();
    } else {
      try {
        const result = await callAdvisory({
          topic: selectedTopic,
          language,
          memories: memories.map((m) => ({ type: m.memory_type, content: m.content })),
          farmerProfile: {
            name: profile?.full_name || undefined,
            state: profile?.state || undefined,
            district: profile?.district || undefined,
            crops: profile?.primary_crops,
          },
        });
        setAdvisory(result);
        if (session?.access_token) {
          keployCapture(
            session.access_token,
            "/functions/v1/advisory",
            "POST",
            { topic: selectedTopic, language },
            200,
            result,
            `advisory_${selectedTopic}_${Date.now()}`
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate advisory");
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleAlchemystGenerate() {
    setStreaming(true);
    setLoading(true);
    try {
      await callAlchemystAdvisoryStream(
        {
          topic: selectedTopic,
          language,
          memories: memories.map((m) => ({ type: m.memory_type, content: m.content })),
          farmerProfile: {
            name: profile?.full_name || undefined,
            state: profile?.state || undefined,
            district: profile?.district || undefined,
            crops: profile?.primary_crops,
          },
          query: question || selectedTopic,
        },
        (step) => {
          setThinkingSteps((prev) => [...prev, step]);
        },
        (chunks) => {
          setRetrievedContext(chunks);
        },
        (text) => {
          setAlchemystAdvisory((prev) => [...prev, text]);
        },
        () => {
          setStreaming(false);
          setLoading(false);
        }
      );
      if (session?.access_token) {
        keployCapture(
          session.access_token,
          "/functions/v1/alchemyst-advisory",
          "POST",
          { topic: selectedTopic, language, alchemyst: true },
          200,
          { thinkingSteps: thinkingSteps.length, advisoryItems: alchemystAdvisory.length },
          `alchemyst_${selectedTopic}_${Date.now()}`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Alchemyst advisory failed");
      setStreaming(false);
      setLoading(false);
    }
  }

  function handleSpeak() {
    const textParts = alchemystMode
      ? alchemystAdvisory
      : advisory
      ? [advisory.greeting, ...advisory.memoryContext, ...advisory.recommendations, advisory.closing]
      : [];
    const text = textParts.filter(Boolean).join(". ");
    if (!text) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = {
      en: "en-US", hi: "hi-IN", mr: "mr-IN", ta: "ta-IN",
      te: "te-IN", bn: "bn-IN", kn: "kn-IN",
    };
    utterance.lang = langMap[language] || "en-US";
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  function handleAskQuestion() {
    if (!question.trim()) return;
    handleGenerate();
    setQuestion("");
  }

  const topicLabel = (topicId: string) => {
    const map: Record<string, string> = {
      general: t("general"), irrigation: t("irrigation"), pest: t("pestManagement"),
      fertilizer: t("fertilizer"), harvesting: t("harvesting"),
    };
    return map[topicId] || topicId;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-blue-600" />
          {t("advisory")}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{t("personalizedAdvice")} - {t("memoryEnabled")} + {t("voiceEnabled")} + RAG</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div>
          {/* Mode toggle */}
          <div className="flex items-center gap-2 mb-4 bg-white rounded-2xl p-2 border border-gray-100 shadow-sm">
            <button
              onClick={() => setAlchemystMode(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                !alchemystMode ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <GnaniLogo size={20} /> Standard Advisory
            </button>
            <button
              onClick={() => setAlchemystMode(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                alchemystMode ? "bg-violet-50 text-violet-700" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <AlchemystLogo size={20} /> Alchemyst RAG + Streaming
            </button>
          </div>

          {/* Topic selection */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">{t("advisoryTopic")}</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
              {TOPICS.map((topic) => {
                const Icon = topic.icon;
                const active = selectedTopic === topic.id;
                return (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      active
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                        : "bg-white border-gray-200 text-gray-600 hover:border-emerald-200"
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${active ? "text-emerald-600" : "text-gray-400"}`} />
                    <span className="text-xs font-medium text-center">{topicLabel(topic.id)}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
                alchemystMode
                  ? "bg-gradient-to-r from-violet-600 to-purple-600"
                  : "bg-gradient-to-r from-blue-600 to-cyan-600"
              }`}
            >
              {loading ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /> {streaming ? "Streaming..." : t("loading")}</>
              ) : (
                <>{t("generateAdvisory")}</>
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200 mb-4">{error}</div>
          )}

          {/* Alchemyst streaming result */}
          {alchemystMode && (thinkingSteps.length > 0 || alchemystAdvisory.length > 0) && (
            <div className="space-y-4 mb-6">
              {/* Visible thinking steps */}
              {thinkingSteps.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-violet-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <AlchemystLogo size={24} />
                    <h3 className="font-bold text-gray-900 text-sm">Alchemyst AI - Thinking Steps</h3>
                    {streaming && <Loader2 className="w-4 h-4 text-violet-500 animate-spin ml-1" />}
                  </div>
                  <div className="space-y-3">
                    {thinkingSteps.map((step, i) => {
                      const isLast = i === thinkingSteps.length - 1;
                      return (
                        <div key={i} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                              streaming && isLast ? "bg-violet-100 text-violet-600" : "bg-emerald-100 text-emerald-600"
                            }`}>
                              {streaming && isLast ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3.5 h-3.5" />
                              )}
                            </div>
                            {i < thinkingSteps.length - 1 && <div className="w-0.5 h-6 bg-gray-200 mt-1" />}
                          </div>
                          <div className="flex-1 pb-1">
                            <p className="text-sm font-semibold text-gray-800">{step.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{step.detail}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Retrieved context (RAG) */}
              {retrievedContext.length > 0 && (
                <div className="bg-white rounded-2xl p-4 border border-violet-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="w-4 h-4 text-violet-500" />
                    <p className="text-xs font-semibold text-violet-700">RAG Retrieved Context</p>
                  </div>
                  <div className="space-y-1.5">
                    {retrievedContext.map((ctx, i) => (
                      <p key={i} className="text-xs text-gray-500 pl-6 border-l-2 border-violet-100">{ctx}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Streaming advisory */}
              {alchemystAdvisory.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-violet-500" />
                      <h2 className="text-lg font-bold text-gray-900">AI Advisory</h2>
                    </div>
                    <button
                      onClick={handleSpeak}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                        speaking ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-violet-100 text-violet-700 hover:bg-violet-200"
                      }`}
                    >
                      {speaking ? <><Square className="w-4 h-4" /> {t("stop")}</> : <><Volume2 className="w-4 h-4" /> {t("listen")}</>}
                    </button>
                  </div>
                  <div className="space-y-3">
                    {alchemystAdvisory.map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-violet-50/50 border border-violet-50 animate-fade-in">
                        <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <p className="text-sm text-gray-700 leading-relaxed">{rec}</p>
                      </div>
                    ))}
                    {streaming && (
                      <div className="flex items-center gap-2 text-violet-500 text-sm pl-3">
                        <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Standard advisory result */}
          {!alchemystMode && advisory && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GnaniLogo size={28} />
                  <h2 className="text-lg font-bold text-gray-900">{advisory.title}</h2>
                </div>
                <button
                  onClick={handleSpeak}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                    speaking ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                >
                  {speaking ? <><Square className="w-4 h-4" /> {t("stop")}</> : <><Volume2 className="w-4 h-4" /> {t("listen")}</>}
                </button>
              </div>

              {advisory.greeting && (
                <p className="text-lg font-semibold text-gray-800 mb-3">{advisory.greeting}</p>
              )}

              {advisory.memoryContext.length > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 mb-4">
                  <Mem0Logo size={20} />
                  <div>
                    <p className="text-xs font-semibold text-emerald-700">Mem0 Memory Context</p>
                    {advisory.memoryContext.map((ctx, i) => (
                      <p key={i} className="text-xs text-emerald-600 mt-0.5">{ctx}</p>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-4">
                {advisory.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-700 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-sm text-blue-900 leading-relaxed">{advisory.closing}</p>
              </div>
            </div>
          )}

          {/* Ask follow-up */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAskQuestion()}
              placeholder={t("askQuestion")}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={handleAskQuestion}
              className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <Send className="w-4 h-4" /> {t("send")}
            </button>
          </div>

          {/* Memory panel */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-gray-900">{t("farmerMemory")}</h3>
              <span className="text-xs text-gray-400 ml-1">(Mem0)</span>
            </div>
            {memories.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">{t("noMemories")}</p>
                <p className="text-xs text-gray-300 mt-1">Save diagnoses to build your memory</p>
              </div>
            ) : (
              <div className="space-y-2">
                {memories.slice(0, 5).map((m) => (
                  <div key={m.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{m.content}</p>
                      <p className="text-xs text-gray-400 mt-0.5 capitalize">{m.memory_type} | {new Date(m.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* News sidebar */}
        <NewsSidebar />
      </div>
    </div>
  );
}
