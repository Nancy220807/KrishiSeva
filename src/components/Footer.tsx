import { useLanguage } from "../contexts/LanguageContext";
import { PARTNERS } from "../lib/types";
import { GnaniLogo, Mem0Logo, KeployLogo, OutlierLogo, AlchemystLogo, StartupNewsLogo } from "./PartnerLogos";
import { Leaf } from "lucide-react";

const PARTNER_LOGO_MAP: Record<string, (props: { size?: number; className?: string }) => JSX.Element> = {
  "Gnani.ai": GnaniLogo,
  "Mem0": Mem0Logo,
  "Keploy": KeployLogo,
  "Outlier": OutlierLogo,
  "Alchemyst AI": AlchemystLogo,
  "StartupNews.fyi": StartupNewsLogo,
};

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">KrishiSeva</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{t("tagline")}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{t("poweredBy")}</h3>
            <div className="grid grid-cols-2 gap-3">
              {PARTNERS.map((partner) => {
                const Logo = PARTNER_LOGO_MAP[partner.name];
                return (
                  <div key={partner.name} className="flex items-center gap-2">
                    {Logo && <Logo size={28} />}
                    <div>
                      <p className="text-sm font-medium text-white">{partner.name}</p>
                      <p className="text-[10px] text-gray-400">{partner.role}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Built for AI for India</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Agriculture + Indic Language AI + AI Agents tracks. Empowering smallholder farmers with accessible, multilingual AI tools.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <p className="text-xs text-gray-500">
            (c) 2026 KrishiSeva. Built for the Build in AI for India Hackathon on Unstop.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function PartnerBar() {
  return (
    <div className="bg-gradient-to-r from-emerald-50 via-white to-blue-50 border-y border-gray-100 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Powered by</span>
          {PARTNERS.map((partner) => {
            const Logo = PARTNER_LOGO_MAP[partner.name];
            return (
              <div key={partner.name} className="flex items-center gap-2 group">
                {Logo && <Logo size={32} />}
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-gray-800">{partner.name}</p>
                  <p className="text-[10px] text-gray-500">{partner.role}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
