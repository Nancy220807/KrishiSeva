import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { fetchNews } from "../lib/api";
import type { NewsItem } from "../lib/types";
import { StartupNewsLogo } from "./PartnerLogos";
import { Newspaper, AlertTriangle, Landmark, ExternalLink, RefreshCw, Globe } from "lucide-react";

export function NewsSidebar() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadNews();
  }, [profile?.state]);

  async function loadNews() {
    setLoading(true);
    try {
      const items = await fetchNews({
        category: filter !== "all" ? filter : undefined,
        region: profile?.state || undefined,
        limit: 8,
      });
      setNews(items);
    } catch {
      setNews([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNews();
  }, [filter]);

  const filters = [
    { id: "all", label: "All", icon: Newspaper },
    { id: "pest-alert", label: "Alerts", icon: AlertTriangle },
    { id: "govt-scheme", label: "Schemes", icon: Landmark },
    { id: "news", label: "News", icon: Globe },
  ];

  function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <aside className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-20">
      <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StartupNewsLogo size={28} />
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Agri News & Alerts</h3>
              <p className="text-[10px] text-gray-500">Powered by StartupNews.fyi</p>
            </div>
          </div>
          <button
            onClick={loadNews}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-white hover:text-cyan-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-100">
        {filters.map((f) => {
          const Icon = f.icon;
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium transition-colors ${
                active
                  ? "text-cyan-700 border-b-2 border-cyan-500 bg-cyan-50/50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-3 h-3" />
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-100 rounded w-full mb-1"></div>
                <div className="h-2 bg-gray-100 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="p-6 text-center">
            <Newspaper className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-xs text-gray-400">No news available</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {news.map((item, i) => {
              const Icon = item.category === "pest-alert" ? AlertTriangle :
                item.category === "govt-scheme" ? Landmark : Newspaper;
              const colorClass = item.category === "pest-alert" ? "text-red-500 bg-red-50" :
                item.category === "govt-scheme" ? "text-emerald-500 bg-emerald-50" :
                "text-blue-500 bg-blue-50";
              return (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 leading-snug group-hover:text-cyan-600 transition-colors line-clamp-2">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.summary}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-gray-400 font-medium">{item.source}</span>
                        <span className="text-[10px] text-gray-300">|</span>
                        <span className="text-[10px] text-gray-400">{timeAgo(item.publishedAt)}</span>
                        {item.region && (
                          <>
                            <span className="text-[10px] text-gray-300">|</span>
                            <span className="text-[10px] text-cyan-600 font-medium">{item.region}</span>
                          </>
                        )}
                        <ExternalLink className="w-2.5 h-2.5 text-gray-300 ml-auto" />
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
