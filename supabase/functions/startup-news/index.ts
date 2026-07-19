import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// StartupNews.fyi - Live agri-tech news in sidebar.
// Filters RSS-style feeds for agriculture keywords and provides
// regional pest outbreak alerts + government scheme notifications.
// In production, this fetches real RSS feeds. For the hackathon demo,
// it returns curated agriculture-relevant news items with live timestamps.

interface NewsItem {
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  category: "news" | "pest-alert" | "govt-scheme";
  region?: string;
}

const AGRICULTURE_KEYWORDS = [
  "agriculture", "farmer", "crop", "harvest", "irrigation", "fertilizer",
  "pest", "disease", "organic", "kisan", "mandi", "msp", "monsoon",
  "drought", "flood", "soil", "seed", "dairy", "poultry", "fishery",
  "horticulture", "sericulture", "agritech", "agri-tech", "rural",
  "subsidy", "scheme", "pm-kisan", "kvk", "krishi",
];

// Curated news database (in production, fetched from RSS feeds)
const NEWS_DATABASE: NewsItem[] = [
  {
    title: "PM-KISAN 19th installment disbursed to 9.8 crore farmers",
    summary: "The 19th installment of PM-KISAN scheme has been released, benefiting 9.8 crore farmers with Rs 2000 each directly to bank accounts.",
    url: "https://pmkisan.gov.in",
    source: "PIB",
    publishedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    category: "govt-scheme",
  },
  {
    title: "Fall Armyworm outbreak alert issued in Maharashtra and Karnataka",
    summary: "ICAR has issued pest alert for Fall Armyworm in maize crops across Maharashtra and Karnataka. Farmers advised to scout fields and apply Emamectin Benzoate 5 SG.",
    url: "https://icar.org.in",
    source: "ICAR",
    publishedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    category: "pest-alert",
    region: "Maharashtra",
  },
  {
    title: "New soil health card distribution drive launched in 12 states",
    summary: "Government launches renewed soil health card distribution. Farmers can get free soil testing at nearest Krishi Vigyan Kendra with crop-specific fertilizer recommendations.",
    url: "https://soilhealth.dac.gov.in",
    source: "DA&FW",
    publishedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    category: "govt-scheme",
  },
  {
    title: "Agri-tech startup raises $15M for AI crop disease detection",
    summary: "Indian agri-tech startup using AI for crop disease detection secures $15M Series A funding. Platform covers 30+ crops in 8 Indian languages.",
    url: "https://startupnews.fyi",
    source: "StartupNews.fyi",
    publishedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    category: "news",
  },
  {
    title: "Wheat rust warning issued for Punjab and Haryana farmers",
    summary: "PAU Ludhiana issues yellow rust warning for wheat crop in Punjab and Haryana. Farmers advised to monitor for orange-brown pustules and spray Propiconazole if detected.",
    url: "https://pau.edu",
    source: "PAU",
    publishedAt: new Date(Date.now() - 18 * 3600000).toISOString(),
    category: "pest-alert",
    region: "Punjab",
  },
  {
    title: "MSP for Rabi crops 2025-26 announced, wheat at Rs 2200/quintal",
    summary: "Cabinet approves MSP for Rabi crops. Wheat MSP raised to Rs 2200 per quintal, mustard at Rs 5950, gram at Rs 5440 per quintal.",
    url: "https://pib.gov.in",
    source: "PIB",
    publishedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    category: "govt-scheme",
  },
  {
    title: "Drone-based pesticide spraying subsidy expanded to 15 states",
    summary: "Central government expands drone spraying subsidy scheme. Farmers can get up to 50% subsidy on drone services for pesticide and fertilizer application.",
    url: "https://agridrone.gov.in",
    source: "DA&FW",
    publishedAt: new Date(Date.now() - 30 * 3600000).toISOString(),
    category: "news",
  },
  {
    title: "Blast disease alert for paddy in Tamil Nadu and Andhra Pradesh",
    summary: "TNAU issues blast disease alert for paddy crop in Tamil Nadu. High humidity and intermittent rainfall favorable for blast. Apply Tricyclazole if symptoms appear.",
    url: "https://tnau.ac.in",
    source: "TNAU",
    publishedAt: new Date(Date.now() - 36 * 3600000).toISOString(),
    category: "pest-alert",
    region: "Tamil Nadu",
  },
  {
    title: "Organic farming certification process simplified for small farmers",
    summary: "NPOP simplifies organic certification process. Small farmers can now get group certification at lower cost. Apply through PGS-India portal.",
    url: "https://pgsindia.gov.in",
    source: "NPOP",
    publishedAt: new Date(Date.now() - 42 * 3600000).toISOString(),
    category: "govt-scheme",
  },
  {
    title: "Kharif sowing crosses last year levels, pulses area up 12%",
    summary: "Kharif sowing has crossed last year's levels with pulses area up 12%. Rice sowing at 382 lakh hectares, soybean at 120 lakh hectares.",
    url: "https://agricoop.gov.in",
    source: "DA&FW",
    publishedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    category: "news",
  },
  {
    title: "Cotton pink bollworm alert in Gujarat and Telangana",
    summary: "CICR issues pink bollworm alert for cotton in Gujarat and Telangana. Farmers advised to install pheromone traps and spray Chlorantraniliprole if ETL crossed.",
    url: "https://cicr.org.in",
    source: "CICR",
    publishedAt: new Date(Date.now() - 54 * 3600000).toISOString(),
    category: "pest-alert",
    region: "Gujarat",
  },
  {
    title: "Crop insurance claim process made fully digital under PMFBY",
    summary: "PMFBY crop insurance claim process is now fully digital. Farmers can file claims through mobile app with crop loss photos. Claim disbursal within 30 days.",
    url: "https://pmfby.gov.in",
    source: "PMFBY",
    publishedAt: new Date(Date.now() - 60 * 3600000).toISOString(),
    category: "govt-scheme",
  },
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category") || "";
    const region = url.searchParams.get("region") || "";
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    let items = [...NEWS_DATABASE];

    // Filter by category
    if (category && category !== "all") {
      items = items.filter((item) => item.category === category);
    }

    // Filter by region (match region or show national news)
    if (region) {
      items = items.filter(
        (item) =>
          !item.region ||
          item.region.toLowerCase() === region.toLowerCase() ||
          item.region.toLowerCase().includes(region.toLowerCase())
      );
    }

    // Sort by most recent
    items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Limit
    items = items.slice(0, limit);

    return new Response(
      JSON.stringify({
        items,
        provider: "startupnews.fyi",
        fetchedAt: new Date().toISOString(),
        total: items.length,
        keywords: AGRICULTURE_KEYWORDS,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
