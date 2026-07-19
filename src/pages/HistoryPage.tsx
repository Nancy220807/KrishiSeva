import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../lib/supabase";
import type { Diagnosis } from "../lib/types";
import { History as HistoryIcon, Leaf, AlertTriangle, CheckCircle, TrendingUp, Filter } from "lucide-react";
import { OutlierLogo } from "../components/PartnerLogos";

export function HistoryPage() {
  const { session } = useAuth();
  const { t } = useLanguage();
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCrop, setFilterCrop] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");

  useEffect(() => {
    async function load() {
      if (!session?.user) return;
      const { data, error } = await supabase
        .from("diagnoses")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      if (error) { console.error(error); setLoading(false); return; }
      setDiagnoses((data as Diagnosis[]) || []);
      setLoading(false);
    }
    load();
  }, [session]);

  const crops = [...new Set(diagnoses.map((d) => d.crop_name))];
  const filtered = diagnoses.filter((d) => {
    if (filterCrop && d.crop_name !== filterCrop) return false;
    if (filterSeverity && d.severity !== filterSeverity) return false;
    return true;
  });

  const avgConfidence = diagnoses.length > 0
    ? diagnoses.reduce((s, d) => s + Number(d.confidence_score), 0) / diagnoses.length
    : 0;
  const flaggedCount = diagnoses.filter((d) => d.outlier_warning).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HistoryIcon className="w-7 h-7 text-amber-600" />
          {t("history")}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{t("recentDiagnoses")}</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{diagnoses.length}</p>
          <p className="text-xs text-gray-500">{t("totalDiagnoses")}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-5 h-5" />
            {(avgConfidence * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-gray-500">Avg {t("confidence")}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            <OutlierLogo size={20} />
            <p className="text-2xl font-bold text-red-600">{flaggedCount}</p>
          </div>
          <p className="text-xs text-gray-500">{t("flagged")}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterCrop}
            onChange={(e) => setFilterCrop(e.target.value)}
            className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white"
          >
            <option value="">All Crops</option>
            {crops.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white"
          >
            <option value="">All Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <p className="text-center text-gray-400 py-16">{t("loading")}</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
          <Leaf className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">{t("noDiagnoses")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <div key={d.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {d.image_url ? (
                  <img src={d.image_url} alt="Crop" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-7 h-7 text-emerald-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{d.disease_name}</h3>
                      <p className="text-sm text-gray-500">{d.crop_name} | {new Date(d.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        d.severity === "high" ? "bg-red-100 text-red-700" :
                        d.severity === "medium" ? "bg-amber-100 text-amber-700" :
                        "bg-green-100 text-green-700"
                      }`}>{d.severity}</span>
                      <span className={`text-xs font-bold ${
                        Number(d.confidence_score) > 0.7 ? "text-emerald-600" :
                        Number(d.confidence_score) > 0.5 ? "text-amber-600" : "text-red-600"
                      }`}>{(Number(d.confidence_score) * 100).toFixed(0)}%</span>
                      {d.outlier_warning ? (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                  </div>
                  {d.symptoms && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{d.symptoms}</p>
                  )}
                  {d.treatment && (
                    <p className="text-xs text-emerald-700 mt-1 line-clamp-1"><span className="font-medium">{t("treatment")}:</span> {d.treatment}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
