import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Multilingual advisory generation with Mem0 memory context.
// Produces contextual, personalized advisories based on farmer history.

interface MemoryContext {
  type: string;
  content: string;
}

interface AdvisoryRequest {
  crop?: string;
  topic?: string;
  language?: string;
  memories?: MemoryContext[];
  farmerProfile?: {
    name?: string;
    state?: string;
    district?: string;
    crops?: string[];
  };
}

const ADVISORY_TEMPLATES: Record<
  string,
  Record<string, { title: string; points: string[]; closing: string }>
> = {
  en: {
    general: {
      title: "Crop Advisory",
      points: [
        "Monitor your crop daily for early signs of pest or disease pressure.",
        "Maintain balanced fertilization - split nitrogen applications into 3 doses.",
        "Ensure proper irrigation scheduling based on soil moisture, not just calendar.",
        "Practice crop rotation to break pest and disease cycles.",
      ],
      closing: "For specific concerns, use the disease detection tool with a photo of the affected plant.",
    },
    irrigation: {
      title: "Irrigation Advisory",
      points: [
        "Water early morning or late evening to reduce evaporation losses.",
        "Use drip irrigation where possible to save 30-50% water.",
        "Monitor soil moisture at root zone depth (15-30 cm).",
        "Avoid waterlogging - ensure field drainage channels are clear.",
      ],
      closing: "Adjust irrigation frequency based on rainfall in your area.",
    },
    pest: {
      title: "Pest Management Advisory",
      points: [
        "Scout fields twice weekly during vulnerable growth stages.",
        "Use yellow sticky traps to monitor flying insect populations.",
        "Apply neem-based pesticides (Azadirachtin 0.03%) as first line of defense.",
        "Avoid broad-spectrum pesticides that kill beneficial insects.",
      ],
      closing: "Integrated Pest Management (IPM) reduces costs and protects beneficial insects.",
    },
    fertilizer: {
      title: "Fertilizer Advisory",
      points: [
        "Get a soil test before applying fertilizers - NPK needs vary by soil type.",
        "Apply basal dose of NPK at sowing, then top-dress nitrogen in splits.",
        "Use organic manure (FYM or compost) @ 5-10 t/ha to improve soil health.",
        "Micronutrients like zinc sulphate @ 25 kg/ha benefit cereals in deficient soils.",
      ],
      closing: "Excess nitrogen increases disease susceptibility - apply only recommended doses.",
    },
    harvesting: {
      title: "Harvesting Advisory",
      points: [
        "Harvest at correct maturity - delayed harvest reduces quality and yield.",
        "Dry grains to 12-14% moisture before storage to prevent fungal growth.",
        "Use clean, dry storage bags or bins to avoid storage pest infestation.",
        "Sort produce by grade for better market prices.",
      ],
      closing: "Timely harvesting and proper storage can increase your income by 15-20%.",
    },
  },
  hi: {
    general: {
      title: "फसल सलाह",
      points: [
        "कीट या बीमारी के शुरुआती लक्षणों के लिए अपनी फसल की रोजाना जांच करें।",
        "संतुलित उर्वरक का उपयोग करें - नाइट्रोजन को 3 खुराक में बांटें।",
        "मिट्टी की नमी के आधार पर सिंचाई करें, केवल कैलेंडर पर निर्भर न रहें।",
        "कीट और बीमारी चक्र तोड़ने के लिए फसल चक्र अपनाएं।",
      ],
      closing: "विशिष्ट समस्याओं के लिए प्रभावित पौधे की फोटो के साथ बीमारी पहचान टूल का उपयोग करें।",
    },
    irrigation: {
      title: "सिंचाई सलाह",
      points: [
        "वाष्पीकरण कम करने के लिए सुबह जल्दी या शाम को पानी दें।",
        "30-50% पानी बचाने के लिए ड्रिप सिंचाई का उपयोग करें।",
        "जड़ क्षेत्र (15-30 सेमी) में मिट्टी की नमी जांचें।",
        "जलभराव से बचें - निकास नाले साफ रखें।",
      ],
      closing: "अपने क्षेत्र की वर्षा के अनुसार सिंचाई आवृत्ति तय करें।",
    },
    pest: {
      title: "कीट प्रबंधन सलाह",
      points: [
        "संवेदनशील अवस्था के दौरान सप्ताह में दो बार खेत की निगरानी करें।",
        "उड़ने वाले कीटों की निगरानी के लिए पीले चिपचिपे जाल का उपयोग करें।",
        "पहली रक्षा के रूप में नीम आधारित कीटनाशक (0.03% एजाडिरैक्टिन) लगाएं।",
        "उपयोगी कीटों को मारने वाले व्यापक स्पेक्ट्रम कीटनाशक से बचें।",
      ],
      closing: "समेकित कीट प्रबंधन (IPM) लागत घटाता है और उपयोगी कीटों की रक्षा करता है।",
    },
    fertilizer: {
      title: "उर्वरक सलाह",
      points: [
        "उर्वरक लगाने से पहले मिट्टी जांच कराएं - NPK जरूरत मिट्टी अनुसार बदलती है।",
        "बुवाई पर आधार खुराक दें, फिर नाइट्रोजन विभाजित खुराक में दें।",
        "मिट्टी स्वास्थ्य के लिए जैविक खाद (FYM या कंपोस्ट) 5-10 टन/हेक्टेयर दें।",
        "सूक्ष्म पोषक जैसे जिंक सल्फेट 25 किग्रा/हेक्टेयर अनाज को लाभ देता है।",
      ],
      closing: "अतिरिक्त नाइट्रोजन बीमारी संवेदनशीलता बढ़ाता है - केवल अनुशंसित खुराक दें।",
    },
    harvesting: {
      title: "कटाई सलाह",
      points: [
        "सही परिपक्वता पर कटाई करें - देरी से गुणवत्ता और उपज कम होती है।",
        "फफूंद से बचने के लिए अनाज को 12-14% नमी पर सुखाएं।",
        "भंडारण कीट से बचने के लिए साफ, सूखी बोरियों का उपयोग करें।",
        "बेहतर बाजार मूल्य के लिए उत्पाद को ग्रेड अनुसार छांटें।",
      ],
      closing: "समय पर कटाई और उचित भंडारण आपकी आय 15-20% बढ़ा सकता है।",
    },
  },
};

// Default to English if language not available
function getTemplate(lang: string, topic: string) {
  const langKey = ADVISORY_TEMPLATES[lang] ? lang : "en";
  const topicKey = ADVISORY_TEMPLATES[langKey][topic] ? topic : "general";
  return ADVISORY_TEMPLATES[langKey][topicKey];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: AdvisoryRequest = await req.json();
    const language = body.language || "en";
    const topic = body.topic || "general";
    const memories = body.memories || [];
    const profile = body.farmerProfile || {};

    const template = getTemplate(language, topic);

    // Build personalized advisory using Mem0 memories
    const personalization: string[] = [];
    if (profile.name) {
      const greeting =
        language === "hi"
          ? `नमस्ते ${profile.name} जी,`
          : `Hello ${profile.name},`;
      personalization.push(greeting);
    }
    if (profile.district) {
      const locationNote =
        language === "hi"
          ? `${profile.district} के लिए अनुकूलित सलाह:`
          : `Advisory tailored for ${profile.district} region:`;
      personalization.push(locationNote);
    }

    // Incorporate Mem0 memory context
    const memoryContext: string[] = [];
    if (memories.length > 0) {
      const recentDiagnoses = memories
        .filter((m) => m.type === "diagnosis")
        .slice(0, 3)
        .map((m) => m.content);
      if (recentDiagnoses.length > 0) {
        const memNote =
          language === "hi"
            ? `पिछली निदान इतिहास के आधार पर: ${recentDiagnoses.join(", ")}`
            : `Based on your past diagnoses: ${recentDiagnoses.join(", ")}`;
        memoryContext.push(memNote);
      }
    }

    const advisory = {
      language,
      topic,
      title: template.title,
      greeting: personalization.join(" "),
      memoryContext: memoryContext,
      recommendations: template.points,
      closing: template.closing,
      generatedAt: new Date().toISOString(),
      mem0Enabled: true,
    };

    return new Response(JSON.stringify(advisory), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
