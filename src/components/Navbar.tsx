import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { SUPPORTED_LANGUAGES } from "../lib/types";
import { Leaf, Menu, X, LogOut, LayoutDashboard, ScanLine, MessageSquare, History, Handshake, Globe } from "lucide-react";

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { profile, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { id: "detect", label: t("detect"), icon: ScanLine },
    { id: "advisory", label: t("advisory"), icon: MessageSquare },
    { id: "history", label: t("history"), icon: History },
    { id: "partners", label: t("partners"), icon: Handshake },
  ];

  function handleNav(id: string) {
    onNavigate(id);
    setMobileOpen(false);
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNav("dashboard")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">KrishiSeva</span>
              <p className="text-[10px] text-emerald-600 font-medium -mt-1">AI for Indian Farmers</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <Globe className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as typeof language)}
                className="appearance-none pl-8 pr-8 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            {profile && (
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white font-semibold text-sm">
                  {profile.full_name.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={signOut}
                  className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title={t("signOut")}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1 border-t border-gray-100 pt-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
            <div className="flex items-center justify-between px-3 pt-3 border-t border-gray-100">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as typeof language)}
                className="text-sm rounded-lg border border-gray-200 px-3 py-1.5"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
              {profile && (
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 text-sm text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  {t("signOut")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
