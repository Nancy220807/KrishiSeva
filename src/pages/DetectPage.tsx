import { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../lib/supabase";
import { callDiagnose, callVoiceSTT, keployCapture, mem0Add } from "../lib/api";
import { COMMON_CROPS, COMMON_SYMPTOMS, type DiagnosisResult, type LanguageCode } from "../lib/types";
import {
  Upload, Mic, MicOff, ScanLine, AlertTriangle, CheckCircle, X,
  Leaf, Activity, Save, RotateCcw, Brain, ShieldCheck,
} from "lucide-react";
import { OutlierLogo } from "../components/PartnerLogos";

// Simple client-side image color analysis
async function analyzeImage(file: File): Promise<{ colors: string[]; textures: string[]; parts: string[] }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve({ colors: [], textures: [], parts: [] }); return; }
      const size = 100;
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      let brownCount = 0, yellowCount = 0, greenCount = 0, whiteCount = 0;
      let darkCount = 0, lightCount = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (r > 80 && r < 180 && g > 50 && g < 140 && b < 100) brownCount++;
        if (r > 180 && g > 180 && b < 150) yellowCount++;
        if (g > r && g > b && g > 80) greenCount++;
        if (r > 200 && g > 200 && b > 200) whiteCount++;
        const brightness = (r + g + b) / 3;
        if (brightness < 80) darkCount++;
        if (brightness > 200) lightCount++;
      }
      const total = data.length / 4;
      const colors: string[] = [];
      if (brownCount / total > 0.1) colors.push("brown");
      if (yellowCount / total > 0.1) colors.push("yellow");
      if (greenCount / total > 0.15) colors.push("green");
      if (whiteCount / total > 0.1) colors.push("white");

      const textures: string[] = [];
      if (brownCount / total > 0.15) textures.push("spots");
      if (whiteCount / total > 0.15) textures.push("powdery");
      if (darkCount / total > 0.2) textures.push("rot");

      const parts = ["leaves"];
      URL.revokeObjectURL(url);
      resolve({ colors, textures, parts });
    };
    img.onerror = () => resolve({ colors: [], textures: [], parts: [] });
    img.src = url;
  });
}

export function DetectPage() {
  const { session, profile } = useAuth();
  const { language, t } = useLanguage();
  const [crop, setCrop] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomText, setSymptomText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSignals, setImageSignals] = useState<{ colors: string[]; textures: string[]; parts: string[] } | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const recognitionRef = useRef<unknown>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      setVoiceSupported(true);
      const recognition = new SR();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === "en" ? "en-US" : language;
      recognition.onresult = (event: { results: { 0: { transcript: string } } }) => {
        const transcript = event.results[0].transcript;
        setSymptomText((prev) => (prev ? prev + " " : "") + transcript);
      };
      recognition.onend = () => setListening(false);
      recognition.onerror = () => setListening(false);
      recognitionRef.current = recognition;
    }
    // Check Gnani voice support
    callVoiceSTT(language as LanguageCode).catch(() => {});
  }, [language]);

  function toggleVoice() {
    const recognition = recognitionRef.current as { start: () => void; stop: () => void } | null;
    if (!recognition) return;
    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      try {
        recognition.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    const signals = await analyzeImage(file);
    setImageSignals(signals);
  }

  function toggleSymptom(symptom: string) {
    setSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  }

  async function handleDetect() {
    if (!crop) { setError(t("selectCrop")); return; }
    setError("");
    setAnalyzing(true);
    setResult(null);
    setSaved(false);
    try {
      const allSymptoms = [...symptoms];
      if (symptomText.trim()) allSymptoms.push(symptomText.trim());

      const res = await callDiagnose({
        crop,
        symptoms: allSymptoms,
        imageColors: imageSignals?.colors,
        imageTextures: imageSignals?.textures,
        imageParts: imageSignals?.parts,
      });
      setResult(res);

      // Keploy: capture this API interaction as a test case
      if (session?.access_token) {
        keployCapture(
          session.access_token,
          "/functions/v1/diagnose",
          "POST",
          { crop, symptoms: allSymptoms },
          200,
          res,
          `diagnose_${crop}_${Date.now()}`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Detection failed");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSave() {
    if (!result || !session?.user) return;
    try {
      const { error: insertError } = await supabase.from("diagnoses").insert({
        user_id: session.user.id,
        crop_name: result.crop,
        disease_name: result.disease,
        confidence_score: result.confidence,
        severity: result.severity,
        symptoms: result.symptoms[language === "hi" ? "hi" : "en"],
        treatment: result.treatment[language === "hi" ? "hi" : "en"],
        prevention: result.prevention[language === "hi" ? "hi" : "en"],
        image_url: imagePreview,
        language,
        outlier_warning: result.outlier_warning,
        outlier_notes: result.outlier_notes,
      });
      if (insertError) throw insertError;

      // Mem0: store this diagnosis in farmer memory
      if (session.access_token) {
        await mem0Add(
          session.access_token,
          "diagnosis",
          `${result.disease} detected on ${result.crop} with ${(result.confidence * 100).toFixed(0)}% confidence`,
          { crop: result.crop, disease: result.disease, confidence: result.confidence }
        );
      }
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  function handleReset() {
    setCrop("");
    setSymptoms([]);
    setSymptomText("");
    setImagePreview(null);
    setImageFile(null);
    setImageSignals(null);
    setResult(null);
    setError("");
    setSaved(false);
  }

  const langKey = language === "hi" ? "hi" : "en";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ScanLine className="w-7 h-7 text-emerald-600" />
          {t("detectDisease")}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{t("step1Desc")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("uploadImage")}</label>
            {imagePreview ? (
              <div className="relative group">
                <img src={imagePreview} alt="Crop" className="w-full h-48 object-cover rounded-xl" />
                <button
                  onClick={() => { setImagePreview(null); setImageFile(null); setImageSignals(null); }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                >
                  <X className="w-4 h-4" />
                </button>
                {imageSignals && imageSignals.colors.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {imageSignals.colors.map((c) => (
                      <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">{c}</span>
                    ))}
                    {imageSignals.textures.map((tx) => (
                      <span key={tx} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 capitalize">{tx}</span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">{t("uploadImage")}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
          </div>

          {/* Crop selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("selectCrop")}</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">{t("selectCrop")}</option>
              {COMMON_CROPS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Symptom chips */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("describeSymptoms")}</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {COMMON_SYMPTOMS.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSymptom(s)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all capitalize ${
                    symptoms.includes(s)
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Voice + text input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("speakSymptoms")} <span className="text-xs text-gray-400">(Gnani.ai)</span>
            </label>
            <div className="relative">
              <textarea
                value={symptomText}
                onChange={(e) => setSymptomText(e.target.value)}
                rows={3}
                placeholder={t("speakSymptoms")}
                className="w-full px-4 py-2.5 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
              <button
                onClick={toggleVoice}
                disabled={!voiceSupported}
                className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  listening ? "bg-red-500 text-white animate-pulse" : "bg-emerald-500 text-white hover:bg-emerald-600"
                } disabled:opacity-40`}
                title={listening ? t("stopListening") : t("startListening")}
              >
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
            {listening && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                {t("recording")} {t("speakNow")}
              </p>
            )}
            {!voiceSupported && (
              <p className="text-xs text-gray-400 mt-1">Voice input not supported in this browser</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDetect}
              disabled={analyzing || !crop}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {analyzing ? (
                <><Activity className="w-5 h-5 animate-spin" /> {t("analyzing")}</>
              ) : (
                <><ScanLine className="w-5 h-5" /> {t("detectDisease")}</>
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200">{error}</div>
          )}
        </div>

        {/* Result panel */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          {!result && !analyzing && (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <Leaf className="w-16 h-16 text-gray-200 mb-4" />
              <p className="text-gray-400">{t("noDiagnoses")}</p>
              <p className="text-xs text-gray-300 mt-1">{t("step1Desc")}</p>
            </div>
          )}

          {analyzing && (
            <div className="h-full flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">{t("analyzing")}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Disease name + confidence */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs text-emerald-600 font-medium uppercase tracking-wide">{result.crop}</span>
                  <h3 className="text-xl font-bold text-gray-900">{result.disease}</h3>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    result.confidence > 0.7 ? "text-emerald-600" :
                    result.confidence > 0.5 ? "text-amber-600" : "text-red-600"
                  }`}>{(result.confidence * 100).toFixed(0)}%</div>
                  <span className="text-xs text-gray-500">{t("confidence")}</span>
                </div>
              </div>

              {/* Severity badge */}
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  result.severity === "high" ? "bg-red-100 text-red-700" :
                  result.severity === "medium" ? "bg-amber-100 text-amber-700" :
                  "bg-green-100 text-green-700"
                }`}>{t("severity")}: {result.severity}</span>
                {result.outlier_warning ? (
                  <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                    <AlertTriangle className="w-3 h-3" /> {t("flagged")}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" /> {t("verified")}
                  </span>
                )}
              </div>

              {/* Outlier validation note */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <OutlierLogo size={20} />
                <div>
                  <p className="text-xs font-semibold text-gray-700">Outlier Validation</p>
                  <p className="text-xs text-gray-500 mt-0.5">{result.outlier_notes}</p>
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">{t("symptoms")}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{result.symptoms[langKey]}</p>
              </div>

              {/* Treatment */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <h4 className="text-sm font-semibold text-emerald-800 mb-1">{t("treatment")}</h4>
                <p className="text-sm text-emerald-900 leading-relaxed">{result.treatment[langKey]}</p>
              </div>

              {/* Prevention */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-800 mb-1">{t("prevention")}</h4>
                <p className="text-sm text-blue-900 leading-relaxed">{result.prevention[langKey]}</p>
              </div>

              {/* Match info */}
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> {result.matched_symptoms}/{result.total_symptoms} symptoms matched</span>
              </div>

              {/* Save button */}
              {!saved ? (
                <button
                  onClick={handleSave}
                  className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> {t("saveDiagnosis")}
                </button>
              ) : (
                <div className="w-full bg-emerald-50 text-emerald-700 font-medium py-3 rounded-xl flex items-center justify-center gap-2 border border-emerald-200">
                  <CheckCircle className="w-4 h-4" /> Saved to history + Mem0 memory
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
