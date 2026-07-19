import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../lib/supabase";
import { mem0List, keployList, outlierReport } from "../lib/api";
import type { Diagnosis, Memory, ApiTest } from "../lib/types";
import {
  ScanLine, Brain, MessageSquare, History, TrendingUp, AlertTriangle,
  CheckCircle, Mic, Database, FlaskConical, Activity, Leaf, ArrowRight,
  Sparkles, Newspaper,
} from "lucide-react";
import { GnaniLogo, Mem0Logo, KeployLogo, OutlierLogo, AlchemystLogo, StartupNewsLogo } from "../components/PartnerLogos";
import { NewsSidebar } from "../components/NewsSidebar";

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { profile, session } = useAuth();
  const { t } = useLanguage();
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [apiTests, setApiTests] = useState<ApiTest[]>([]);
  const [outlierStats, setOutlierStats] = useState<{
    totalDiagnoses: number; flaggedCount: number; averageConfidence: number; flagRate: number; bySeverity: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!session?.user) return;
      const token = session.access_token;
      setLoading(true);
      try {
        const [diagRes, memData, testData, outlierData] = await Promise.all([
          supabase.from("diagnoses").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(5),
          mem0List(token, 5).catch(() => []),
          keployList(token).catch(() => []),
          outlierReport(token).catch(() => null),
        ]);
        setDiagnoses((diagRes.data as Diagnosis[]) || []);
        setMemories(memData as Memory[]);
        setApiTests(testData as ApiTest[]);
        setOutlierStats(outlierData);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [session]);

  const totalDiagnoses = outlierStats?.totalDiagnoses ?? diagnoses.length;
  const flaggedCount = outlierStats?.flaggedCount ?? diagnoses.filter((d) => d.outlier_warning).length;
  const avgConfidence = outlierStats?.averageConfidence ?? 0;

  const stats = [
    { label: t("totalDiagnoses"), value: totalDiagnoses, icon: ScanLine, color: "emerald", bg: "bg-emerald-50", text: "text-emerald-700" },
    { label: t("memoryCount"), value: memories.length, icon: Brain, color: "green", bg: "bg-green-50", text: "text-green-700" },
    { label: t("apiTests"), value: apiTests.length, icon: FlaskConical, color: "amber", bg: "bg-amber-50", text: "text-amber-700" },
    { label: t("flagged"), value: flaggedCount, icon: AlertTriangle, color: "red", bg: "bg-red-50", text: "text-red-700" },
  ];

  const quickActions = [
    { id: "detect", label: t("detect"), icon: ScanLine, desc: t("step1Desc"), color: "from-emerald-500 to-green-600" },
    { id: "advisory", label: t("advisory"), icon: MessageSquare, desc: t("personalizedAdvice"), color: "from-blue-500 to-cyan-600" },
    { id: "history", label: t("history"), icon: History, desc: t("recentDiagnoses"), color: "from-amber-500 to-orange-600" },
    { id: "partners", label: t("partners"), icon: Activity, desc: t("howPartnersHelp"), color: "from-purple-500 to-pink-600" },
  ];

  const partnerCards = [
    { name: "Gnani.ai", role: t("voiceEnabled"), icon: Mic, logo: GnaniLogo, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Mem0", role: t("memoryEnabled"), icon: Brain, logo: Mem0Logo, color: "text-emerald-600", bg: "bg-emerald-50" },
    { name: "Keploy", role: t("testEnabled"), icon: FlaskConical, logo: KeployLogo, color: "text-amber-600", bg: "bg-amber-50" },
    { name: "Outlier", role: t("validationEnabled"), icon: CheckCircle, logo: OutlierLogo, color: "text-red-600", bg: "bg-red-50" },
    { name: "Alchemyst AI", role: "RAG Advisory", icon: Sparkles, logo: AlchemystLogo, color: "text-violet-600", bg: "bg-violet-50" },
    { name: "StartupNews.fyi", role: "Live News", icon: Newspaper, logo: StartupNewsLogo, color: "text-cyan-600", bg: "bg-cyan-50" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white font-bold text-lg">
            {profile?.full_name?.charAt(0).toUpperCase() || "F"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("welcome")}, {profile?.full_name?.split(" ")[0] || "Farmer"}
            </h1>
            <p className="text-sm text-gray-500">
              {profile?.district && `${profile.district}, `}
              {profile?.state || "India"} | {t("memberSince")} {new Date(profile?.created_at || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${stat.text}`} />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">{t("quickActions")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onNavigate(action.id)}
              className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all text-left"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{action.label}</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">{action.desc}</p>
              <span className="inline-flex items-center gap-1 text-sm text-emerald-600 font-medium group-hover:gap-2 transition-all">
                {t("continue")} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent diagnoses */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">{t("recentDiagnoses")}</h3>
            <button onClick={() => onNavigate("history")} className="text-sm text-emerald-600 font-medium hover:underline">
              {t("viewAll")}
            </button>
          </div>
          {loading ? (
            <p className="text-sm text-gray-400 py-8 text-center">{t("loading")}</p>
          ) : diagnoses.length === 0 ? (
            <div className="text-center py-8">
              <Leaf className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">{t("noDiagnoses")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {diagnoses.slice(0, 4).map((d) => (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{d.disease_name}</p>
                    <p className="text-xs text-gray-500">{d.crop_name} | {new Date(d.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      d.severity === "high" ? "bg-red-100 text-red-700" :
                      d.severity === "medium" ? "bg-amber-100 text-amber-700" :
                      "bg-green-100 text-green-700"
                    }`}>{d.severity}</span>
                    {d.outlier_warning && <AlertTriangle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Partner integration panel */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">{t("partnerIntegration")}</h3>
          <div className="grid grid-cols-2 gap-3">
            {partnerCards.map((card) => {
              const Logo = card.logo;
              const Icon = card.icon;
              return (
                <div key={card.name} className={`p-4 rounded-xl ${card.bg} border border-gray-100`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Logo size={28} />
                    <Icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{card.name}</p>
                  <p className="text-xs text-gray-500">{card.role}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Outlier validation summary + News sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {outlierStats && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <OutlierLogo size={28} />
              <h3 className="font-bold text-gray-900">Outlier {t("validationEnabled")}</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">{t("totalDiagnoses")}</p>
                <p className="text-xl font-bold text-gray-900">{outlierStats.totalDiagnoses}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("flagged")}</p>
                <p className="text-xl font-bold text-red-600">{outlierStats.flaggedCount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Flag Rate</p>
                <p className="text-xl font-bold text-gray-900">{(outlierStats.flagRate * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Avg {t("confidence")}</p>
                <p className="text-xl font-bold text-emerald-600 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {(avgConfidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        )}
        <NewsSidebar />
      </div>
    </div>
  );
}
