# KrishiSeva

**AI-Powered Crop Disease Detection & Multilingual Advisory Web App for Indian Smallholder Farmers**

Built for the **Build in AI for India** Hackathon on Unstop.
Tracks: Agriculture + Indic Language AI + AI Agents

## Features

- **Crop Disease Detection** - Upload a photo or describe symptoms to detect diseases across 9 major Indian crops (Rice, Wheat, Tomato, Cotton, Maize, Potato, Groundnut, Sugarcane, Chilli)
- **Multilingual Support** - Full UI in 7 Indian languages: English, Hindi, Marathi, Tamil, Telugu, Bengali, Kannada
- **Voice Input/Output** - Speak symptoms instead of typing; listen to advisories read aloud
- **Personalized Advisory** - AI agent generates contextual farming advice using farmer memory
- **Farmer Dashboard** - Each user gets their own dashboard with diagnosis history, stats, and memory
- **Disease History** - Track all past diagnoses with filtering by crop and severity

## Hackathon Partner Integrations (All 6)

| Partner | Role | Integration |
|---------|------|-------------|
| **Gnani.ai** | Voice AI (STT + TTS) | Voice input on detection page (Web Speech API + Gnani endpoint), voice output on advisory page with native Indic pronunciation |
| **Mem0** | Persistent Farmer Memory | Every diagnosis is stored as farmer memory; advisory generation uses past context for personalization |
| **Keploy** | API Test Generation | Every API call is captured as a replayable test case (zero-code test generation) |
| **Outlier** | Advisory Quality Validation | Statistical confidence checks run before showing results; suspicious predictions are flagged with warnings |
| **Alchemyst AI** | Context-Enriched LLM Advisory | RAG over farming knowledge base with streaming advisory generation. Shows visible thinking steps so farmers see the reasoning behind each recommendation |
| **StartupNews.fyi** | Live Agri-Tech News & Alerts | RSS feed filtered for agriculture keywords with regional pest outbreak alerts and government scheme notifications in a live sidebar |

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Database**: 5 tables with Row Level Security (profiles, diagnoses, memories, feedback, api_tests)
- **Edge Functions**: 6 deployed serverless functions (diagnose, advisory, voice, mem0-memory, keploy-capture, outlier-validate, alchemyst-advisory, startup-news)

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

```
src/
  components/      # Navbar, Footer, PartnerLogos
  contexts/        # AuthContext, LanguageContext
  lib/             # supabase client, types, i18n, api helpers
  pages/           # Auth, Dashboard, Detect, Advisory, History, Partners
supabase/
  functions/       # Edge functions (diagnose, advisory, voice, mem0, keploy, outlier)
```

## Supported Languages

English, हिन्दी (Hindi), मराठी (Marathi), தமிழ் (Tamil), తెలుగు (Telugu), বাংলা (Bengali), ಕನ್ನಡ (Kannada)

## License

Built for the Build in AI for India Hackathon.
