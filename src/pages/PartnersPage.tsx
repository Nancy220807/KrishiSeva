import { useLanguage } from "../contexts/LanguageContext";
import { PARTNERS } from "../lib/types";
import { GnaniLogo, Mem0Logo, KeployLogo, OutlierLogo, AlchemystLogo, StartupNewsLogo } from "../components/PartnerLogos";
import { Handshake, Mic, Brain, FlaskConical, ShieldCheck, ArrowRight, Sparkles, Newspaper } from "lucide-react";

const PARTNER_MAP: Record<string, { logo: (props: { size?: number; className?: string }) => JSX.Element; icon: typeof Mic }> = {
  "Gnani.ai": { logo: GnaniLogo, icon: Mic },
  "Mem0": { logo: Mem0Logo, icon: Brain },
  "Keploy": { logo: KeployLogo, icon: FlaskConical },
  "Outlier": { logo: OutlierLogo, icon: ShieldCheck },
  "Alchemyst AI": { logo: AlchemystLogo, icon: Sparkles },
  "StartupNews.fyi": { logo: StartupNewsLogo, icon: Newspaper },
};

export function PartnersPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 mb-4">
          <Handshake className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{t("partnerIntegration")}</h1>
        <p className="text-gray-500 mt-2 max-w-2xl mx-auto">{t("howPartnersHelp")}</p>
      </div>

      {/* Partner showcase grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {PARTNERS.map((partner, idx) => {
          const { logo: Logo, icon: Icon } = PARTNER_MAP[partner.name];
          return (
            <div
              key={partner.name}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Logo size={56} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4" style={{ color: partner.color }} />
                    <h3 className="text-lg font-bold text-gray-900">{partner.name}</h3>
                  </div>
                  <p className="text-sm font-medium mb-2" style={{ color: partner.color }}>{partner.role}</p>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{partner.description}</p>
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <ArrowRight className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-500">{partner.integration}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Integration architecture */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
        <h2 className="text-xl font-bold mb-6">Integration Architecture</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <GnaniLogo size={32} />
            <h4 className="font-semibold mt-3 mb-1">Voice Layer</h4>
            <p className="text-xs text-gray-300">Speech-to-text input on detection page. Text-to-speech output on advisory page with native Indic pronunciation.</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <Mem0Logo size={32} />
            <h4 className="font-semibold mt-3 mb-1">Memory Layer</h4>
            <p className="text-xs text-gray-300">Every diagnosis and interaction is stored as farmer memory. Advisory generation uses past context for personalization.</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <KeployLogo size={32} />
            <h4 className="font-semibold mt-3 mb-1">Testing Layer</h4>
            <p className="text-xs text-gray-300">Every API call is captured as a replayable test case. Zero-code test generation proves backend reliability.</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <OutlierLogo size={32} />
            <h4 className="font-semibold mt-3 mb-1">Validation Layer</h4>
            <p className="text-xs text-gray-300">Statistical confidence checks run before showing results. Suspicious predictions are flagged with warnings.</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <AlchemystLogo size={32} />
            <h4 className="font-semibold mt-3 mb-1">RAG Advisory Layer</h4>
            <p className="text-xs text-gray-300">Context-enriched LLM generation with RAG over farming knowledge base. Streaming advisory with visible thinking steps shows the reasoning behind each recommendation.</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <StartupNewsLogo size={32} />
            <h4 className="font-semibold mt-3 mb-1">News & Alerts Layer</h4>
            <p className="text-xs text-gray-300">Live RSS feed filtered for agriculture keywords. Regional pest outbreak alerts and government scheme notifications in a live sidebar.</p>
          </div>
        </div>
      </div>

      {/* Hackathon tracks */}
      <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Hackathon Tracks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: "Agriculture", desc: "Crop disease detection with treatment recommendations for smallholder farmers" },
            { name: "Indic Language AI", desc: "7 Indian languages with voice input/output via Gnani.ai for native pronunciation" },
            { name: "AI Agents", desc: "Mem0-powered persistent memory makes KrishiSeva a personalized AI farming agent" },
          ].map((track) => (
            <div key={track.name} className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <h3 className="font-semibold text-emerald-800 mb-1">{track.name}</h3>
              <p className="text-xs text-emerald-600 leading-relaxed">{track.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
