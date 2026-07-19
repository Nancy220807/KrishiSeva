import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { diagnoseCrop, SUPPORTED_CROPS, CROP_DISEASES } from "./knowledge.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Outlier validation layer - statistical confidence checks before showing results.
// Flags suspicious predictions with warnings.
function outlierValidate(
  disease: string,
  confidence: number,
  crop: string,
  matchedSymptomCount: number,
  totalSymptoms: number
): { warning: boolean; notes: string } {
  const notes: string[] = [];
  let warning = false;

  // Check 1: Confidence too high with few symptom matches - suspicious
  if (confidence > 0.9 && matchedSymptomCount < 2) {
    warning = true;
    notes.push(
      "High confidence with limited symptom matches - please verify visually."
    );
  }

  // Check 2: Confidence too low - unreliable
  if (confidence < 0.45) {
    warning = true;
    notes.push(
      "Low statistical confidence - recommend consulting local Krishi Vigyan Kendra."
    );
  }

  // Check 3: Unknown crop
  if (!SUPPORTED_CROPS.map((c) => c.toLowerCase()).includes(crop.toLowerCase())) {
    warning = true;
    notes.push("Crop not in verified database - prediction may be inaccurate.");
  }

  // Check 4: Disease-crop mismatch sanity check
  const validDisease = CROP_DISEASES.find(
    (d) =>
      d.disease === disease &&
      d.crop.toLowerCase() === crop.toLowerCase()
  );
  if (!validDisease) {
    warning = true;
    notes.push("Disease-crop combination not in knowledge base.");
  }

  // Check 5: Match ratio statistical check
  const matchRatio = matchedSymptomCount / totalSymptoms;
  if (matchRatio < 0.3) {
    warning = true;
    notes.push("Low symptom overlap - prediction flagged for review.");
  }

  return {
    warning,
    notes: notes.join(" ") || "All statistical checks passed.",
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      crop,
      symptoms,
      imageColors,
      imageTextures,
      imageParts,
    } = body;

    if (!crop) {
      return new Response(
        JSON.stringify({ error: "Crop name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const observedSymptoms: string[] = Array.isArray(symptoms) ? symptoms : [];
    const imageSignals = {
      colors: Array.isArray(imageColors) ? imageColors : [],
      textures: Array.isArray(imageTextures) ? imageTextures : [],
      affectedParts: Array.isArray(imageParts) ? imageParts : [],
    };

    const result = diagnoseCrop(crop, observedSymptoms, imageSignals);

    if (!result) {
      return new Response(
        JSON.stringify({
          error: "Could not diagnose. Please provide more symptoms or check the crop name.",
          supportedCrops: SUPPORTED_CROPS,
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Run Outlier validation
    const matchedCount = result.disease.symptoms.filter((s) =>
      [...observedSymptoms, ...imageSignals.colors, ...imageSignals.textures, ...imageSignals.affectedParts]
        .some((sig) => sig.toLowerCase().includes(s) || s.includes(sig.toLowerCase()))
    ).length;

    const validation = outlierValidate(
      result.disease.disease,
      result.confidence,
      crop,
      matchedCount,
      result.disease.symptoms.length
    );

    const response = {
      crop: result.disease.crop,
      disease: result.disease.disease,
      confidence: Number(result.confidence.toFixed(3)),
      severity: result.disease.severity,
      symptoms: result.disease.symptomsDescription,
      treatment: result.disease.treatment,
      prevention: result.disease.prevention,
      outlier_warning: validation.warning,
      outlier_notes: validation.notes,
      matched_symptoms: matchedCount,
      total_symptoms: result.disease.symptoms.length,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
