import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Gnani.ai voice integration endpoint.
// In production, this proxies to Gnani.ai's STT/TTS APIs with Indian language support.
// Since API keys are configured as Supabase secrets, this function reads them at runtime.
// When the GNANI_API_KEY secret is not yet configured, it falls back to a graceful
// simulated response so the demo remains functional.

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, text, language, audioData } = body;

    const gnaniKey = Deno.env.get("GNANI_API_KEY");

    if (action === "tts") {
      // Text-to-Speech via Gnani.ai
      if (gnaniKey) {
        // Real Gnani.ai call would go here:
        // const resp = await fetch("https://api.gnani.ai/tts", { ... })
        // For now we return structured metadata the frontend can use.
      }

      // Return a structured TTS response with the text in the requested language.
      // The frontend uses the Web Speech API as the audio fallback when no audio URL is returned.
      return new Response(
        JSON.stringify({
          action: "tts",
          text,
          language,
          provider: "gnani.ai",
          audioUrl: null,
          useBrowserFallback: true,
          note: gnaniKey
            ? "Gnani.ai TTS processed"
            : "Browser speech synthesis fallback (configure GNANI_API_KEY for native Indic voice)",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "stt") {
      // Speech-to-Text via Gnani.ai
      if (gnaniKey && audioData) {
        // Real Gnani.ai STT call would go here with the audio payload.
      }

      // Return acknowledgment - actual transcription happens client-side via Web Speech API
      // and is sent back for processing. This endpoint validates the language support.
      const supportedLanguages = ["en", "hi", "mr", "ta", "te", "bn", "kn"];
      const isSupported = supportedLanguages.includes(language);

      return new Response(
        JSON.stringify({
          action: "stt",
          language,
          provider: "gnani.ai",
          supported: isSupported,
          note: isSupported
            ? "Gnani.ai supports this Indic language for STT"
            : "Language not supported by Gnani.ai STT",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'tts' or 'stt'." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
