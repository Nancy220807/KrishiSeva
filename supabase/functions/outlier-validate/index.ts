import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Outlier advisory quality validation layer.
// Performs statistical confidence checks on predictions and aggregates
// validation metrics across the farmer's diagnosis history.

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Invalid auth token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const userId = userData.user.id;

    const body = await req.json();
    const { action } = body;

    if (action === "validate") {
      // Validate a single prediction
      const { confidence, matchedSymptoms, totalSymptoms, crop, disease } = body;

      const issues: string[] = [];
      let warning = false;
      let confidenceLevel = "high";

      if (confidence < 0.45) {
        warning = true;
        confidenceLevel = "low";
        issues.push("Confidence below 45% threshold");
      } else if (confidence < 0.65) {
        confidenceLevel = "medium";
        issues.push("Moderate confidence - recommend visual confirmation");
      }

      const matchRatio = totalSymptoms > 0 ? matchedSymptoms / totalSymptoms : 0;
      if (matchRatio < 0.3) {
        warning = true;
        issues.push("Symptom match ratio below 30%");
      }

      // Statistical outlier check: confidence far from expected range
      if (confidence > 0.95) {
        warning = true;
        issues.push("Suspiciously high confidence - possible overfit");
      }

      return new Response(
        JSON.stringify({
          valid: !warning,
          warning,
          confidenceLevel,
          issues: issues.length > 0 ? issues : ["All statistical checks passed"],
          matchRatio: Number(matchRatio.toFixed(3)),
          provider: "outlier",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "report") {
      // Aggregate validation report across user's diagnoses
      const { data: diagnoses, error } = await supabase
        .from("diagnoses")
        .select("confidence_score, outlier_warning, severity, disease_name")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const all = diagnoses || [];
      const flagged = all.filter((d) => d.outlier_warning);
      const avgConfidence =
        all.length > 0
          ? all.reduce((sum, d) => sum + Number(d.confidence_score), 0) / all.length
          : 0;

      const bySeverity: Record<string, number> = {};
      for (const d of all) {
        bySeverity[d.severity] = (bySeverity[d.severity] || 0) + 1;
      }

      return new Response(
        JSON.stringify({
          totalDiagnoses: all.length,
          flaggedCount: flagged.length,
          flagRate: all.length > 0 ? Number((flagged.length / all.length).toFixed(3)) : 0,
          averageConfidence: Number(avgConfidence.toFixed(3)),
          bySeverity,
          provider: "outlier",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use validate or report." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
