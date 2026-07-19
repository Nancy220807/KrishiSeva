// Crop disease knowledge base for KrishiSeva
// This powers the rule-based disease detection engine.
// Each disease has visual symptoms used to match against farmer-reported observations
// and optional image analysis signals.

export interface DiseaseRecord {
  crop: string;
  disease: string;
  symptoms: string[];
  severity: "low" | "medium" | "high";
  confidenceBaseline: number; // base confidence when symptom match occurs
  treatment: {
    en: string;
    hi: string;
  };
  prevention: {
    en: string;
    hi: string;
  };
  symptomsDescription: {
    en: string;
    hi: string;
  };
}

export const CROP_DISEASES: DiseaseRecord[] = [
  {
    crop: "Rice",
    disease: "Blast",
    symptoms: ["spots", "lesions", "white", "gray", "leaves", "rot"],
    severity: "high",
    confidenceBaseline: 0.82,
    symptomsDescription: {
      en: "Diamond-shaped lesions with gray-white centers and brown borders appear on leaves. Lesions may enlarge and kill entire leaves. Node infection causes rotting and lodging.",
      hi: "पत्तियों पर हीरे के आकार के धब्बे दिखाई देते हैं जिनका केंद्र सफेद-ग्रे होता है और किनारे भूरे होते हैं। धब्बे बढ़कर पूरी पत्ती को सूखा सकते हैं।",
    },
    treatment: {
      en: "Apply Tricyclazole 75 WP @ 0.6 g/L or Azoxystrobin 23 SC @ 1 ml/L as foliar spray. Repeat after 10 days if needed.",
      hi: "ट्राइसाइक्लाजोल 75 WP 0.6 ग्राम/लीटर या एज़ोक्सीस्ट्रोबिन 23 SC 1 मिली/लीटर का छिड़काव करें। 10 दिन बाद दोहराएं।",
    },
    prevention: {
      en: "Use resistant varieties like Pusa Basmati-1. Avoid excess nitrogen. Maintain proper spacing. Burn infected stubble.",
      hi: "प्रतिरोधी किस्में जैसे पुसा बासमती-1 का उपयोग करें। अतिरिक्त नाइट्रोजन से बचें। सही दूरी बनाए रखें। संक्रमित अवशेष जलाएं।",
    },
  },
  {
    crop: "Rice",
    disease: "Bacterial Blight",
    symptoms: ["yellow", "wilt", "leaves", "water", "soaked", "edges"],
    severity: "high",
    confidenceBaseline: 0.78,
    symptomsDescription: {
      en: "Water-soaked lesions on leaf edges that turn yellow and wilt. Lesions spread along the leaf blade. Kresek phase causes entire seedling to wilt and roll up.",
      hi: "पत्ती के किनारों पर पानी से भरे धब्बे दिखते हैं जो पीले होकर मुरझा जाते हैं। धब्बे पूरी पत्ती पर फैल जाते हैं।",
    },
    treatment: {
      en: "Spray Streptomycin sulphate + Tetracycline mixture @ 500 ppm. Copper oxychloride 0.3% can also be used.",
      hi: "स्ट्रेप्टोमाइसिन सल्फेट + टेट्रासाइक्लिन मिश्रण 500 ppm का छिड़काव करें। कॉपर ऑक्सीक्लोराइड 0.3% भी उपयोग करें।",
    },
    prevention: {
      en: "Use disease-free seeds. Grow resistant varieties like IR64. Avoid injury to roots during transplanting. Drain field during infection.",
      hi: "रोग मुक्त बीज का उपयोग करें। IR64 जैसी प्रतिरोधी किस्म उगाएं। रोपाई के दौरान जड़ों को नुकसान से बचाएं।",
    },
  },
  {
    crop: "Wheat",
    disease: "Rust (Brown)",
    symptoms: ["rust", "orange", "brown", "pustules", "powdery", "leaves"],
    severity: "high",
    confidenceBaseline: 0.85,
    symptomsDescription: {
      en: "Orange-brown powdery pustules appear on leaves, arranged in random fashion. Pustules rupture the leaf surface and release spores. Severe infection causes shriveled grains.",
      hi: "पत्तियों प� नारंगी-भूरे चूर्णित फुंसियां दिखाई देती हैं। फुंसियां पत्ती की सतह को तोड़कर बीजाणु छोड़ती हैं। गहरे संक्रमण से दाने सिकुड़ जाते हैं।",
    },
    treatment: {
      en: "Spray Propiconazole 25 EC @ 1 ml/L or Tebuconazole 25.9 EC @ 1 ml/L at first sign of disease. Repeat after 15 days.",
      hi: "प्रोपिकोनाजोल 25 EC 1 मिली/लीटर या टेबुकोनाजोल 25.9 EC 1 मिली/लीटर का छिड़काव करें। 15 दिन बाद दोहराएं।",
    },
    prevention: {
      en: "Grow resistant varieties like HD-2967, DBW-187. Avoid late sowing. Remove volunteer wheat plants. Balanced fertilization.",
      hi: "HD-2967, DBW-187 जैसी प्रतिरोधी किस्में उगाएं। देर से बुवाई से बचें। स्वयं उगे गेहूं के पौधे हटाएं।",
    },
  },
  {
    crop: "Wheat",
    disease: "Loose Smut",
    symptoms: ["black", "powdery", "spores", "head", "grain", "empty"],
    severity: "medium",
    confidenceBaseline: 0.75,
    symptomsDescription: {
      en: "Black powdery spore masses replace the grain in the ear head. Affected ears emerge earlier than healthy ones. Only the central axis of the spike remains.",
      hi: "कानी में दानों की जगह काले चूर्णित बीजाणु ले लेते हैं। प्रभावित बालियां स्वस्थ बालियों से पहले निकलती हैं।",
    },
    treatment: {
      en: "Treat seeds with Carboxin 75 WP @ 2 g/kg or Tebuconazole 2 g/kg seed before sowing.",
      hi: "बुवाई से पहले बीज को कार्बोक्सिन 75 WP 2 ग्राम/किग्रा या टेबुकोनाजोल 2 ग्राम/किग्रा से उपचार करें।",
    },
    prevention: {
      en: "Use certified disease-free seed. Hot water treatment at 52°C for 11 minutes. Remove infected ears before spores spread.",
      hi: "प्रमाणित रोग मुक्त बीज का उपयोग करें। 52°C पर 11 मिनट गर्म पानी उपचार। बीजाणु फैलने से पहले संक्रमित बालियां हटाएं।",
    },
  },
  {
    crop: "Tomato",
    disease: "Early Blight",
    symptoms: ["spots", "concentric", "rings", "brown", "leaves", "yellow"],
    severity: "medium",
    confidenceBaseline: 0.83,
    symptomsDescription: {
      en: "Dark brown spots with concentric rings (target-board pattern) on older leaves. Surrounding tissue turns yellow. Spots enlarge and merge, causing defoliation.",
      hi: "पुरानी पत्तियों पर संकेंद्रित छल्लों वाले गहरे भूरे धब्बे दिखते हैं। आसपास का ऊतक पीला हो जाता है। धब्बे बढ़कर पत्ती गिरा देते हैं।",
    },
    treatment: {
      en: "Spray Mancozeb 75 WP @ 2.5 g/L or Chlorothalonil 75 WP @ 2 g/L at 7-10 day intervals. Add sticker for better coverage.",
      hi: "मैंकोजेब 75 WP 2.5 ग्राम/लीटर या क्लोरोथालोनिल 75 WP 2 ग्राम/लीटर 7-10 दिन के अंतराल पर छिड़काव करें।",
    },
    prevention: {
      en: "Crop rotation with non-solanaceous crops. Remove infected plant debris. Use certified seeds. Avoid overhead irrigation.",
      hi: "गैर-सोलानेसियस फसलों के साथ फसल चक्र। संक्रमित पौधों के अवशेष हटाएं। प्रमाणित बीज का उपयोग करें।",
    },
  },
  {
    crop: "Tomato",
    disease: "Late Blight",
    symptoms: ["water", "soaked", "gray", "green", "rot", "white", "mold"],
    severity: "high",
    confidenceBaseline: 0.8,
    symptomsDescription: {
      en: "Water-soaked gray-green patches on leaves that turn brown-black. White mold growth appears on undersides of leaves in humid conditions. Fruits develop brown firm rot.",
      hi: "पत्तियों पर पानी से भरे ग्रे-हरे धब्बे दिखते हैं जो भूरे-काले हो जाते हैं। नमी में पत्तियों के नीचे सफेद फफूंद दिखती है।",
    },
    treatment: {
      en: "Spray Cymoxanil + Mancozeb @ 3 g/L or Dimethomorph 50 WP @ 1 g/L. Repeat every 5-7 days during favorable weather.",
      hi: "साइमोक्सानिल + मैंकोजेब 3 ग्राम/लीटर या डाइमेथोमॉर्फ 50 WP 1 ग्राम/लीटर का छिड़काव करें। 5-7 दिन में दोहराएं।",
    },
    prevention: {
      en: "Use resistant varieties. Avoid planting in low-lying areas. Ensure good drainage. Destroy infected plants immediately.",
      hi: "प्रतिरोधी किस्में उपयोग करें। निचले इलाकों में रोपण से बचें। अच्छी जल निकासी सुनिश्चित करें।",
    },
  },
  {
    crop: "Cotton",
    disease: "Boll Rot",
    symptoms: ["rot", "brown", "boll", "lint", "discoloration", "soft"],
    severity: "high",
    confidenceBaseline: 0.77,
    symptomsDescription: {
      en: "Bolls develop soft brown rot starting from the tip. Lint becomes discolored and fails to open. Infected bolls may drop prematurely.",
      hi: "टिप से बालियां नरम भूरी सड़न शुरू करती हैं। रेशा रंग बदल जाता है और नहीं खुलता। संक्रमित बालियां जल्दी गिर सकती हैं।",
    },
    treatment: {
      en: "Spray Carbendazim 50 WP @ 1 g/L or Azoxystrobin 23 SC @ 1 ml/L targeting bolls. Ensure good canopy management.",
      hi: "कार्बेंडाजिम 50 WP 1 ग्राम/लीटर या एज़ोक्सीस्ट्रोबिन 23 SC 1 मिली/लीटर बालियों पर छिड़काव करें।",
    },
    prevention: {
      en: "Maintain proper plant spacing for ventilation. Avoid late irrigation. Control bollworms to prevent entry wounds. Use disease-free seed.",
      hi: "हवादार रोपण के लिए सही दूरी रखें। देर से सिंचाई से बचें। घाव प्रवेश को रोकने के लिए बोलवर्म नियंत्रित करें।",
    },
  },
  {
    crop: "Maize",
    disease: "Downy Mildew",
    symptoms: ["yellow", "streaks", "white", "downy", "growth", "stunted"],
    severity: "high",
    confidenceBaseline: 0.79,
    symptomsDescription: {
      en: "Yellow streaks appear on leaves followed by white downy growth on undersides. Plants become stunted with chlorotic leaves. Ear formation is affected.",
      hi: "पत्तियों पर पीली धारियां दिखती हैं और नीचे सफेद रोएंदार वृद्धि होती है। पौधे छोटे रह जाते हैं।",
    },
    treatment: {
      en: "Spray Metalaxyl 35 SD @ 1 g/L or Mancozeb 75 WP @ 2.5 g/L. Seed treatment with Metalaxyl @ 6 g/kg is effective.",
      hi: "मेटालैक्सिल 35 SD 1 ग्राम/लीटर या मैंकोजेब 75 WP 2.5 ग्राम/लीटर छिड़काव करें। बीज उपचार भी प्रभावी है।",
    },
    prevention: {
      en: "Use resistant hybrids. Avoid continuous maize cropping. Remove infected plants early. Ensure proper drainage.",
      hi: "प्रतिरोधी संकर का उपयोग करें। लगातार मक्का उगाने से बचें। संक्रमित पौधे जल्दी हटाएं।",
    },
  },
  {
    crop: "Potato",
    disease: "Early Blight",
    symptoms: ["spots", "concentric", "rings", "brown", "leaves", "yellow"],
    severity: "medium",
    confidenceBaseline: 0.82,
    symptomsDescription: {
      en: "Dark brown concentric ring spots on lower leaves. Yellow halo surrounds spots. Severe infection causes defoliation and reduced tuber size.",
      hi: "निचली पत्तियों पर गहरे भूरे संकेंद्रित छल्लों वाले धब्बे। धब्बों के चारों ओर पीला हेलो।",
    },
    treatment: {
      en: "Spray Mancozeb 75 WP @ 2.5 g/L or Azoxystrobin 23 SC @ 1 ml/L at 10-day intervals.",
      hi: "मैंकोजेब 75 WP 2.5 ग्राम/लीटर या एज़ोक्सीस्ट्रोबिन 23 SC 1 मिली/लीटर 10 दिन के अंतराल पर छिड़काव करें।",
    },
    prevention: {
      en: "Crop rotation with cereals. Use disease-free seed tubers. Maintain adequate potassium fertilization. Remove volunteer plants.",
      hi: "अनाज के साथ फसल चक्र। रोग मुक्त बीज ट्यूबर का उपयोग करें। पर्याप्त पोटेशियम उर्वरक दें।",
    },
  },
  {
    crop: "Groundnut",
    disease: "Tikka Leaf Spot",
    symptoms: ["spots", "brown", "yellow", "halo", "leaves", "defoliation"],
    severity: "medium",
    confidenceBaseline: 0.8,
    symptomsDescription: {
      en: "Small brown circular spots with yellow halo on leaves. Two types - early and late spot. Severe infection causes premature defoliation and yield loss.",
      hi: "पत्तियों पर पीले हेलो वाले छोटे भूरे गोल धब्बे। गहरा संक्रमण पत्ती गिरने और उपज कम होने का कारण बनता है।",
    },
    treatment: {
      en: "Spray Chlorothalonil 75 WP @ 2 g/L or Tebuconazole 25.9 EC @ 1 ml/L at 30 and 45 days after sowing.",
      hi: "क्लोरोथालोनिल 75 WP 2 ग्राम/लीटर या टेबुकोनाजोल 25.9 EC 1 मिली/लीटर बुवाई के 30 और 45 दिन बाद छिड़काव करें।",
    },
    prevention: {
      en: "Use resistant varieties. Crop rotation. Avoid continuous groundnut. Maintain proper plant spacing.",
      hi: "प्रतिरोधी किस्में उपयोग करें। फसल चक्र। लगातार मूंगफली से बचें। सही पौध दूरी रखें।",
    },
  },
  {
    crop: "Sugarcane",
    disease: "Red Rot",
    symptoms: ["red", "rot", "pith", "setts", "wilt", "smell"],
    severity: "high",
    confidenceBaseline: 0.76,
    symptomsDescription: {
      en: "Internal pith turns red with white patches in the center. Affected canes show wilt and drying of leaves. Setts rot and fail to germinate.",
      hi: "आंतरिक भाग लाल हो जाता है और केंद्र में सफेद धब्बे दिखते हैं। प्रभावित गन्ने मुरझाते हैं।",
    },
    treatment: {
      en: "No chemical cure once infected. Rogue out affected clumps. Use disease-free setts from nurseries.",
      hi: "संक्रमित होने पर कोई रासायनिक इलाज नहीं। प्रभावित गुच्छे निकाल दें। रोग मुक्त सेट का उपयोग करें।",
    },
    prevention: {
      en: "Use resistant varieties like Co-86032. Treat setts with Carbendazim @ 2.5 g/L before planting. Avoid ratooning in infected fields.",
      hi: "Co-86032 जैसी प्रतिरोधी किस्में उपयोग करें। रोपण से पहले सेट को कार्बेंडाजिम 2.5 ग्राम/लीटर से उपचार करें।",
    },
  },
  {
    crop: "Chilli",
    disease: "Powdery Mildew",
    symptoms: ["white", "powdery", "coating", "leaves", "yellow", "curl"],
    severity: "medium",
    confidenceBaseline: 0.81,
    symptomsDescription: {
      en: "White powdery coating on leaves and stems. Affected leaves curl, turn yellow, and drop. Fruits may show yellow patches.",
      hi: "पत्तियों और तनों पर सफेद चूर्णित आवरण। प्रभावित पत्तियां मुड़कर पीली होकर गिर जाती हैं।",
    },
    treatment: {
      en: "Spray Wettable Sulphur @ 3 g/L or Hexaconazole 5 SC @ 1 ml/L. Repeat after 10 days if needed.",
      hi: "वेटेबल सल्फर 3 ग्राम/लीटर या हेक्साकोनाजोल 5 SC 1 मिली/लीटर छिड़काव करें। 10 दिन बाद दोहराएं।",
    },
    prevention: {
      en: "Maintain proper spacing for air circulation. Avoid excessive nitrogen. Remove infected leaves promptly.",
      hi: "हवा के प्रवाह के लिए सही दूरी रखें। अत्यधिक नाइट्रोजन से बचें। संक्रमित पत्तियां तुरंत हटाएं।",
    },
  },
];

// Simple color/feature signals that may come from image analysis
export interface ImageSignals {
  colors: string[]; // e.g. ["brown", "yellow", "white"]
  textures: string[]; // e.g. ["spots", "powdery", "rot"]
  affectedParts: string[]; // e.g. ["leaves", "boll", "fruit"]
}

export function diagnoseCrop(
  crop: string,
  observedSymptoms: string[],
  imageSignals?: ImageSignals
): { disease: DiseaseRecord; confidence: number } | null {
  const cropLower = crop.toLowerCase().trim();
  const candidates = CROP_DISEASES.filter(
    (d) => d.crop.toLowerCase() === cropLower
  );

  if (candidates.length === 0) return null;

  // Combine text symptoms and image signals
  const allSignals = [
    ...observedSymptoms.map((s) => s.toLowerCase()),
    ...(imageSignals?.colors || []).map((c) => c.toLowerCase()),
    ...(imageSignals?.textures || []).map((t) => t.toLowerCase()),
    ...(imageSignals?.affectedParts || []).map((p) => p.toLowerCase()),
  ];

  let bestMatch: DiseaseRecord | null = null;
  let bestScore = 0;

  for (const disease of candidates) {
    const matched = disease.symptoms.filter((s) =>
      allSignals.some((signal) =>
        signal.includes(s) || s.includes(signal)
      )
    );
    const matchRatio = matched.length / disease.symptoms.length;
    const confidence = disease.confidenceBaseline * (0.5 + 0.5 * matchRatio);

    if (confidence > bestScore) {
      bestScore = confidence;
      bestMatch = disease;
    }
  }

  if (!bestMatch || bestScore < 0.35) return null;

  return { disease: bestMatch, confidence: Math.min(bestScore, 0.98) };
}

export const SUPPORTED_CROPS = [
  "Rice",
  "Wheat",
  "Tomato",
  "Cotton",
  "Maize",
  "Potato",
  "Groundnut",
  "Sugarcane",
  "Chilli",
];
