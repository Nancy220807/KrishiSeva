import { useState, useEffect } from "react";
import { AuthProvider, useAuth, getPreferredLanguage } from "./contexts/AuthContext";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./pages/Dashboard";
import { DetectPage } from "./pages/DetectPage";
import { AdvisoryPage } from "./pages/AdvisoryPage";
import { HistoryPage } from "./pages/HistoryPage";
import { PartnersPage } from "./pages/PartnersPage";
import { Navbar } from "./components/Navbar";
import { Footer, PartnerBar } from "./components/Footer";
import { Leaf } from "lucide-react";

function AppContent() {
  const { session, profile, loading } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Sync language with profile preference
  useEffect(() => {
    if (profile) {
      const lang = getPreferredLanguage(profile);
      if (lang !== language) setLanguage(lang);
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Leaf className="w-9 h-9 text-white" />
          </div>
          <p className="text-gray-500">Loading KrishiSeva...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      <PartnerBar />
      <main className="flex-1">
        {currentPage === "dashboard" && <Dashboard onNavigate={setCurrentPage} />}
        {currentPage === "detect" && <DetectPage />}
        {currentPage === "advisory" && <AdvisoryPage />}
        {currentPage === "history" && <HistoryPage />}
        {currentPage === "partners" && <PartnersPage />}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider initialLanguage="en">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
