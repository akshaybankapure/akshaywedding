"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════
   LANGUAGES
   English is the default — it's the one script every guest on both
   sides reads. Marathi and Kannada are one tap away.

   The choice lives in the URL (?lang=en | mr | kn) so a link can be
   shared already in the right language: send the Kolhapur side
   ?lang=mr and the Belagavi side ?lang=kn. Short aliases ma/ka/eng
   are accepted too, since that's how people naturally type them.

   Names of people and places are never translated — only transliterated
   where we have a verified spelling in lib/config.js.
   ═══════════════════════════════════════════════════════════════════ */

export const LANGS = [
  { code: "en", label: "EN", name: "English" },
  { code: "mr", label: "मराठी", name: "Marathi" },
  { code: "kn", label: "ಕನ್ನಡ", name: "Kannada" },
];

const ALIASES = { ma: "mr", mar: "mr", marathi: "mr", ka: "kn", kan: "kn", kannada: "kn", eng: "en", english: "en" };

export function normaliseLang(raw) {
  if (!raw) return null;
  const v = String(raw).toLowerCase().trim();
  const code = ALIASES[v] || v;
  return LANGS.some((l) => l.code === code) ? code : null;
}

const T = {
  /* ── chrome & navigation ── */
  partyMode:      { en: "Party mode", mr: "पार्टी मोड", kn: "ಪಾರ್ಟಿ ಮೋಡ್" },
  ambientSound:   { en: "Ambient sound", mr: "संगीत", kn: "ಸಂಗೀತ" },
  switchTheme:    { en: "Switch theme", mr: "रंगसंगती बदला", kn: "ಬಣ್ಣ ಬದಲಿಸಿ" },
  language:       { en: "Language", mr: "भाषा", kn: "ಭಾಷೆ" },

  navAntarpat:    { en: "Antarpat", mr: "अंतरपाट", kn: "ಅಂತರಪಟ" },
  navParivar:     { en: "Family", mr: "परिवार", kn: "ಕುಟುಂಬ" },
  navAshirwad:    { en: "Blessings", mr: "आशीर्वाद", kn: "ಆಶೀರ್ವಾದ" },
  navMuhurat:     { en: "The day", mr: "मुहूर्त", kn: "ಮುಹೂರ್ತ" },
  navRasta:       { en: "Directions", mr: "रस्ता", kn: "ದಾರಿ" },
  navYeta:        { en: "RSVP", mr: "येता का?", kn: "ಬರ್ತೀರಾ?" },
  navWall:        { en: "Wishes", mr: "शुभेच्छा", kn: "ಶುಭಾಶಯ" },

  /* ── hero ── */
  weds:           { en: "weds", mr: "विवाहबद्ध", kn: "ವಿವಾಹ" },
  saveTheDate:    { en: "Save the date", mr: "तारीख जपून ठेवा", kn: "ದಿನಾಂಕ ಉಳಿಸಿ" },
  venueBtn:       { en: "Venue", mr: "ठिकाण", kn: "ಸ್ಥಳ" },
  scrollSlowly:   { en: "scroll slowly", mr: "हळू हळू स्क्रोल करा", kn: "ನಿಧಾನವಾಗಿ ಸ್ಕ್ರೋಲ್ ಮಾಡಿ" },
  sunday:         { en: "Sunday", mr: "रविवार", kn: "ಭಾನುವಾರ" },
  sonOf:          { en: "Son of", mr: "चिरंजीव", kn: "ಪುತ್ರ" },
  daughterOf:     { en: "Daughter of", mr: "कन्या", kn: "ಪುತ್ರಿ" },

  /* ── families ── */
  parivarEyebrow: { en: "Two · Family", mr: "दोन · परिवार", kn: "ಎರಡು · ಕುಟುಂಬ" },
  twoFamilies:    { en: "Two families, one day", mr: "दोन कुटुंबं, एक दिवस", kn: "ಎರಡು ಕುಟುಂಬ, ಒಂದು ದಿನ" },
  groomsSide:     { en: "Groom's side", mr: "वरपक्ष", kn: "ವರನ ಕಡೆ" },
  bridesSide:     { en: "Bride's side", mr: "वधूपक्ष", kn: "ವಧುವಿನ ಕಡೆ" },
  ourFamilies:    { en: "Our families", mr: "आमची कुटुंबं", kn: "ನಮ್ಮ ಕುಟುಂಬಗಳು" },
  ritualsOfDay:   { en: "The rituals of the day", mr: "दिवसाचे विधी", kn: "ದಿನದ ವಿಧಿಗಳು" },

  /* ── remembrance ── */
  ashirwadEyebrow:{ en: "Blessings from above", mr: "स्वर्गीय आशीर्वाद", kn: "ಸ್ವರ್ಗೀಯ ಆಶೀರ್ವಾದ" },
  rememberedHead: { en: "Remembered with love", mr: "स्मरणात, प्रेमाने", kn: "ಪ್ರೀತಿಯಿಂದ ಸ್ಮರಣೆ" },
  rememberedNote: {
    en: "Not with us in person today, but present in every blessing.",
    mr: "आज सोबत नाहीत, पण प्रत्येक आशीर्वादात आहेत.",
    kn: "ಇಂದು ಜೊತೆಗಿಲ್ಲ, ಆದರೆ ಪ್ರತಿ ಆಶೀರ್ವಾದದಲ್ಲಿದ್ದಾರೆ.",
  },

  /* ── the day ── */
  muhuratEyebrow: { en: "Three · The day", mr: "तीन · मुहूर्त", kn: "ಮೂರು · ಮುಹೂರ್ತ" },
  oneDay:         { en: "One day. Everything that matters.", mr: "एक दिवस. सारं काही.", kn: "ಒಂದು ದಿನ. ಎಲ್ಲವೂ ಇಲ್ಲೇ." },
  dress:          { en: "Dress", mr: "पोशाख", kn: "ಉಡುಗೆ" },

  /* ── directions ── */
  rastaEyebrow:   { en: "Four · Directions", mr: "चार · रस्ता", kn: "ನಾಲ್ಕು · ದಾರಿ" },
  findingMandap:  { en: "Finding the mandap", mr: "मांडवाचा रस्ता", kn: "ಮಂಟಪದ ದಾರಿ" },
  openInMaps:     { en: "Open in Maps", mr: "नकाशात उघडा", kn: "ನಕ್ಷೆಯಲ್ಲಿ ತೆರೆಯಿರಿ" },
  navigateGps:    { en: "Navigate by GPS", mr: "GPS ने या", kn: "GPS ಮೂಲಕ ಬನ್ನಿ" },
  copy:           { en: "copy", mr: "कॉपी", kn: "ನಕಲಿಸಿ" },
  copied:         { en: "copied ✓", mr: "कॉपी झालं ✓", kn: "ನಕಲಾಯಿತು ✓" },
  mapHint:        { en: "Tap a place for directions · north is up", mr: "ठिकाणावर टॅप करा · वर उत्तर दिशा", kn: "ಸ್ಥಳವನ್ನು ಒತ್ತಿ · ಮೇಲೆ ಉತ್ತರ" },

  /* ── rsvp ── */
  yetaEyebrow:    { en: "Five · RSVP", mr: "पाच · येता का?", kn: "ಐದು · ಬರ್ತೀರಾ?" },
  areYouComing:   { en: "So… you're coming?", mr: "मग… येताय ना?", kn: "ಹಾಗಾದರೆ… ಬರ್ತಿದ್ದೀರಾ?" },
  yourName:       { en: "Your good name", mr: "तुमचं नाव", kn: "ನಿಮ್ಮ ಹೆಸರು" },
  howMany:        { en: "How many of you?", mr: "किती जण?", kn: "ಎಷ್ಟು ಜನ?" },
  mealPref:       { en: "Meal preference (all pure veg)", mr: "जेवणाची पसंती (सर्व शाकाहारी)", kn: "ಊಟದ ಆಯ್ಕೆ (ಎಲ್ಲವೂ ಸಸ್ಯಾಹಾರಿ)" },
  anythingKnow:   { en: "Anything we should know?", mr: "काही सांगायचंय का?", kn: "ಏನಾದರೂ ತಿಳಿಸಬೇಕೆ?" },
  sendRsvp:       { en: "Pakka done", mr: "नक्की येणार", kn: "ಖಂಡಿತ ಬರ್ತೀನಿ" },
  alreadyComing:  { en: "already coming", mr: "आधीच येणार आहेत", kn: "ಈಗಾಗಲೇ ಬರುತ್ತಿದ್ದಾರೆ" },

  /* ── wishes ── */
  wallEyebrow:    { en: "Six · Wishes", mr: "सहा · शुभेच्छा", kn: "ಆರು · ಶುಭಾಶಯ" },
  leaveBlessing:  { en: "Leave a blessing", mr: "आशीर्वाद द्या", kn: "ಆಶೀರ್ವಾದ ನೀಡಿ" },
  yourWish:       { en: "Your wish for them", mr: "तुमच्या शुभेच्छा", kn: "ನಿಮ್ಮ ಶುಭಾಶಯ" },
  whoFrom:        { en: "From", mr: "कोणाकडून", kn: "ಯಾರಿಂದ" },
  pinToWall:      { en: "Pin it to the wall", mr: "भिंतीवर लावा", kn: "ಗೋಡೆಗೆ ಸೇರಿಸಿ" },

  /* ── live ceremony ── */
  joiningAfar:    { en: "Joining from afar?", mr: "दुरून सामील होताय?", kn: "ದೂರದಿಂದ ಸೇರುತ್ತಿದ್ದೀರಾ?" },
  happeningNow:   { en: "The muhurat is happening now", mr: "मुहूर्त सुरू आहे", kn: "ಮುಹೂರ್ತ ನಡೆಯುತ್ತಿದೆ" },
  joinLive:       { en: "Join live", mr: "सामील व्हा", kn: "ಸೇರಿಕೊಳ್ಳಿ" },
  throwAkshata:   { en: "Throw akshata", mr: "अक्षता टाका", kn: "ಅಕ್ಷತೆ ಹಾಕಿ" },
  tapAsMany:      { en: "tap as many times as your heart says", mr: "मनसोक्त टॅप करा", kn: "ಮನಸಾರೆ ಒತ್ತಿರಿ" },
  grainsThrown:   { en: "grains thrown", mr: "अक्षता पडल्या", kn: "ಅಕ್ಷತೆ ಬಿದ್ದಿದೆ" },
  joiningFromAfar:{ en: "joining from afar", mr: "दुरून सामील", kn: "ದೂರದಿಂದ ಸೇರಿದವರು" },
  yours:          { en: "yours", mr: "तुमच्या", kn: "ನಿಮ್ಮದು" },
  beginsIn:       { en: "The muhurat begins in", mr: "मुहूर्ताला उरलेला वेळ", kn: "ಮುಹೂರ್ತಕ್ಕೆ ಉಳಿದ ಸಮಯ" },
  stayWithUs:     { en: "stay with us", mr: "थांबा, सोबत रहा", kn: "ನಮ್ಮೊಂದಿಗಿರಿ" },

  /* ── countdown units ── */
  days:           { en: "days", mr: "दिवस", kn: "ದಿನ" },
  hours:          { en: "hours", mr: "तास", kn: "ಗಂಟೆ" },
  minutes:        { en: "minutes", mr: "मिनिटं", kn: "ನಿಮಿಷ" },
  seconds:        { en: "seconds", mr: "सेकंद", kn: "ಸೆಕೆಂಡ್" },

  /* ── guide tabs ── */
  tabFood:        { en: "Food", mr: "जेवण", kn: "ಊಟ" },
  tabDress:       { en: "Dress", mr: "पोशाख", kn: "ಉಡುಗೆ" },
  tabTravel:      { en: "Travel", mr: "प्रवास", kn: "ಪ್ರಯಾಣ" },
  tabInsider:     { en: "Good to know", mr: "टिपा", kn: "ಸಲಹೆ" },
};

const LangCtx = createContext({ lang: "en", t: (k) => T[k]?.en ?? k, setLang: () => {} });

export function useLang() { return useContext(LangCtx); }

export function LangProvider({ children }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = normaliseLang(params.get("lang"));
    if (fromUrl) { setLangState(fromUrl); return; }
    /* No explicit choice: stay in English. We deliberately do NOT sniff
       the browser locale — a guest whose phone is set to Marathi may
       still prefer reading the invitation in English. */
  }, []);

  const setLang = useCallback((code) => {
    const next = normaliseLang(code) || "en";
    setLangState(next);
    const url = new URL(window.location.href);
    if (next === "en") url.searchParams.delete("lang");
    else url.searchParams.set("lang", next);
    window.history.replaceState({}, "", url);       // shareable, no reload
    document.documentElement.lang = next;
  }, []);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const t = useCallback((key) => {
    const row = T[key];
    if (!row) return key;
    return row[lang] || row.en;
  }, [lang]);

  return <LangCtx.Provider value={{ lang, t, setLang }}>{children}</LangCtx.Provider>;
}
