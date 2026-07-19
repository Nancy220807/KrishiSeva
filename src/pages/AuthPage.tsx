import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { SUPPORTED_LANGUAGES } from "../lib/types";
import { Leaf, Mail, Lock, User, Globe, ArrowRight, ScanLine, MessageSquare, Brain } from "lucide-react";
import { GnaniLogo, Mem0Logo, KeployLogo, OutlierLogo, AlchemystLogo, StartupNewsLogo } from "../components/PartnerLogos";

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        if (!fullName.trim()) throw new Error("Please enter your full name");
        await signUp(email, password, fullName);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel - branding */}
      <div className="lg:w-1/2 bg-gradient-to-br from-emerald-600 via-green-700 to-teal-800 text-white p-8 lg:p-16 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-emerald-300 blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">KrishiSeva</h1>
              <p className="text-emerald-100 text-sm">AI for Indian Farmers</p>
            </div>
          </div>

          <h2 className="text-2xl lg:text-3xl font-bold mb-4 leading-tight">
            {t("tagline")}
          </h2>
          <p className="text-emerald-100 mb-8 leading-relaxed">{t("empowering")}</p>

          <div className="space-y-4 mb-8">
            {[
              { icon: ScanLine, text: t("step1Desc") },
              { icon: Brain, text: t("step2Desc") },
              { icon: MessageSquare, text: t("step3Desc") },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm text-emerald-50 pt-2">{item.text}</p>
                </div>
              );
            })}
          </div>

          <div className="pt-6 border-t border-white/20">
            <p className="text-xs text-emerald-200 mb-3 uppercase tracking-wider font-semibold">{t("poweredBy")}</p>
            <div className="flex items-center gap-4 flex-wrap">
              <GnaniLogo size={36} />
              <Mem0Logo size={36} />
              <KeployLogo size={36} />
              <OutlierLogo size={36} />
              <AlchemystLogo size={36} />
              <StartupNewsLogo size={36} />
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-gray-700">{t("selectLanguage")}</span>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as typeof language)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {mode === "signin" ? t("signIn") : t("signUp")}
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            {mode === "signin" ? t("alreadyHaveAccount") : t("dontHaveAccount")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("fullName")}</label>
                <div className="relative">
                  <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ramesh Kumar"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("email")}</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="farmer@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("password")}</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="******"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? t("loading") : mode === "signin" ? t("signIn") : t("createAccount")}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600">
            {mode === "signin" ? t("dontHaveAccount") : t("alreadyHaveAccount")}{" "}
            <button
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
              className="text-emerald-600 font-semibold hover:underline"
            >
              {mode === "signin" ? t("signUp") : t("signIn")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
