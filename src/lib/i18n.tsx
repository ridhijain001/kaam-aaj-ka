import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang } from "./types";

const dict = {
  appName: { hi: "कामसेतु", en: "KaamSetu", ta: "காம்செது" },
  tagline: {
    hi: "भरोसेमंद काम, आसान भाषा में",
    en: "Trusted work, in simple language",
    ta: "நம்பகமான வேலை, எளிய மொழியில்",
  },
  welcome: { hi: "स्वागत है", en: "Welcome", ta: "வரவேற்கிறோம்" },
  iWantWork: { hi: "मुझे काम चाहिए", en: "I want work", ta: "எனக்கு வேலை வேண்டும்" },
  iWantHire: { hi: "मुझे काम पर रखना है", en: "I want to hire", ta: "நான் வேலைக்கு சேர்க்க வேண்டும்" },
  chooseLanguage: { hi: "अपनी भाषा चुनें", en: "Choose your language", ta: "உங்கள் மொழியைத் தேர்வுசெய்க" },
  continue: { hi: "आगे बढ़ें", en: "Continue", ta: "தொடரவும்" },
  locationTitle: { hi: "अपनी जगह बताएँ", en: "Share your location", ta: "உங்கள் இடத்தைப் பகிரவும்" },
  locationSub: {
    hi: "हम आपके पास की नौकरियाँ और कारीगर दिखाएँगे",
    en: "We'll show jobs and workers near you",
    ta: "உங்கள் அருகிலுள்ள வேலைகளையும் தொழிலாளர்களையும் காட்டுவோம்",
  },
  allow: { hi: "अनुमति दें", en: "Allow", ta: "அனுமதி" },
  skip: { hi: "अभी नहीं", en: "Skip for now", ta: "தற்போது தவிர்" },
  home: { hi: "होम", en: "Home", ta: "முகப்பு" },
  jobs: { hi: "नौकरियाँ", en: "Jobs", ta: "வேலைகள்" },
  apps: { hi: "आवेदन", en: "Applications", ta: "விண்ணப்பங்கள்" },
  chat: { hi: "चैट", en: "Chat", ta: "அரட்டை" },
  profile: { hi: "प्रोफ़ाइल", en: "Profile", ta: "சுயவிவரம்" },
  dashboard: { hi: "डैशबोर्ड", en: "Dashboard", ta: "டாஷ்போர்டு" },
  post: { hi: "नई जॉब", en: "Post", ta: "வேலை இடு" },
  manage: { hi: "मेरी जॉब", en: "My Jobs", ta: "என் வேலைகள்" },
  applicants: { hi: "आवेदक", en: "Applicants", ta: "விண்ணப்பதாரர்கள்" },
  nearYou: { hi: "आपके पास", en: "Near you", ta: "உங்கள் அருகில்" },
  searchPlaceholder: { hi: "क्या काम चाहिए?", en: "What work do you need?", ta: "என்ன வேலை வேண்டும்?" },
  explainJob: { hi: "💬 यह नौकरी समझाएँ", en: "💬 Explain this job", ta: "💬 இந்த வேலையை விளக்கு" },
  listen: { hi: "🔊 सुनें", en: "🔊 Listen", ta: "🔊 கேள்" },
  stop: { hi: "⏸ रोकें", en: "⏸ Stop", ta: "⏸ நிறுத்து" },
  apply: { hi: "आवेदन करें", en: "Apply now", ta: "விண்ணப்பிக்க" },
  whatsapp: { hi: "व्हाट्सऐप", en: "WhatsApp", ta: "வாட்ஸ்அப்" },
  call: { hi: "कॉल करें", en: "Call", ta: "அழைக்க" },
  smartSummary: { hi: "✨ स्मार्ट सारांश", en: "✨ Smart Summary", ta: "✨ ஸ்மார்ட் சுருக்கம்" },
  bestFor: { hi: "👤 इनके लिए सबसे अच्छा", en: "👤 Best suited for", ta: "👤 இவர்களுக்கு ஏற்றது" },
  thingsToKnow: { hi: "⚠ ध्यान दें", en: "⚠ Things to know", ta: "⚠ கவனிக்க" },
  benefits: { hi: "✓ अच्छी बातें", en: "✓ Why this is good", ta: "✓ நன்மைகள்" },
  matchScore: { hi: "मिलान", en: "Match", ta: "பொருத்தம்" },
  appliedOk: { hi: "आवेदन भेज दिया!", en: "Application sent!", ta: "விண்ணப்பம் அனுப்பப்பட்டது!" },
  back: { hi: "वापस", en: "Back", ta: "பின்" },
  nextStep: { hi: "अगला", en: "Next", ta: "அடுத்து" },
  publish: { hi: "जॉब पब्लिश करें", en: "Publish job", ta: "வேலையை வெளியிடு" },
  stepCategory: { hi: "किस तरह का कारीगर?", en: "Which worker type?", ta: "எந்த வகை தொழிலாளர்?" },
  stepReq: { hi: "ज़रूरतें", en: "Requirements", ta: "தேவைகள்" },
  stepSalary: { hi: "वेतन", en: "Salary", ta: "சம்பளம்" },
  stepLocation: { hi: "जगह", en: "Location", ta: "இடம்" },
  stepShift: { hi: "शिफ्ट", en: "Shift", ta: "ஷிப்ட்" },
  stepExtra: { hi: "और जानकारी", en: "Extra details", ta: "மேலதிக விவரம்" },
  stepPreview: { hi: "देखें और पब्लिश करें", en: "Preview & publish", ta: "முன்னோட்டம்" },
  generating: { hi: "AI सरल कर रहा है…", en: "AI is simplifying…", ta: "AI எளிமைப்படுத்துகிறது…" },
  aiSimplified: { hi: "✨ AI ने आसान भाषा में बनाया", en: "✨ AI simplified version", ta: "✨ AI எளிய பதிப்பு" },
};

type DictKey = keyof typeof dict;
type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: DictKey) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("hi");
  useEffect(() => {
    try {
      const s = localStorage.getItem("ks.lang") as Lang | null;
      if (s) setLangState(s);
    } catch {}
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("ks.lang", l); } catch {}
  };
  const t = (k: DictKey) => dict[k]?.[lang] ?? dict[k]?.en ?? String(k);
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const c = useContext(I18nContext);
  if (!c) throw new Error("useI18n outside provider");
  return c;
}

export const langLabel: Record<Lang, string> = {
  hi: "हिन्दी",
  en: "English",
  ta: "தமிழ்",
};

export const ttsLocale: Record<Lang, string> = {
  hi: "hi-IN",
  en: "en-IN",
  ta: "ta-IN",
};
