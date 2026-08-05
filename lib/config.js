/* ═══════════════════════════════════════════════════════════════════
   ✏️  EDIT ME — every name, date, venue and phone number lives here.
   Only real, confirmed details. Nothing invented.
   ═══════════════════════════════════════════════════════════════════ */

export const CONFIG = {
  groom: {
    en: "Akshay", dev: "अक्षय", kan: "ಅಕ್ಷಯ್", surname: "Bankapure",
    family: "Bankapure parivaar",
    parents: "Son of Smt. Rupali Bankapure & Late Shri Ashok Bankapure",
    siblings: "Brother of Nishchay, Shweta (Pramod Khot) & Divya (Sharad Tirth)",
  },
  bride: {
    en: "Shraddha", dev: "श्रद्धा", kan: "ಶ್ರದ್ಧಾ", surname: "Sangave",
    family: "Sangave parivaar",
    parents: "Daughter of Shri Babaso Sangave & Late Smt. Lata Babaso Sangave",
    siblings: "Sister of Sumeru Sangave — and aatya to his two little ones",
  },

  /* Remembered with love in the footer. "Smt." is the honorific for a
     married woman; "Shri" is the masculine one — so Lata-tai is Smt. */
  remembrance: [
    "कै. श्री. अशोक बंकापुरे · Late Shri Ashok Bankapure",
    "कै. सौ. लता बाबासो सांगवे · Late Smt. Lata Babaso Sangave",
    "कै. श्री. बाबासब कल्लप्पा बंकापुरे · Late Shri Babasab Kallappa Bankapure",
    "कै. श्री. कल्लप्पा कृष्ण बंकापुरे · Late Shri Kallappa Krishna Bankapure",
    "कै. सौ. इंदिराबाई कल्लप्पा बंकापुरे · Late Smt. Indirabai Kallappa Bankapure",
    "कै. श्री. अमित बाबासब बंकापुरे · Late Shri Amit Babasab Bankapure",
  ],
  familiesLine: "Bankapure · Magadum · Khot · Tirth · Kallimani · Ruge  · Sangave · Ghat · Patil ",
  hashtag: "#AkshayWedsShraddha",

  /* The cousins — the ones who'll actually run the day. */
  cousins: ["Sammed", "Darshan", "Sandesh", "Sujit", "Aishwarya", "Priya", "Rohit", "Arihant",],
  seniorCousins: ["Mahaveer", "Pratibha", "Swapnil (K)", "Saarika", "Sachin", "Sujata", "Sonali", "Nikhil", "Amruta", "Anant", "Pallavi", "Swapnil (M)", "Prashant", "Praveen" ],
  seniorCousinsLine: "ज्येष्ठ भावंडे",
  seniorCousinsLineEn: "The senior cousins",
  seniorCousinsRole: "The calm, the coordination, and the backup plan",
  cousinsLine: "भावंडंची फौज",
  cousinsLineEn: "The cousin brigade",
  cousinsRole: "Logistics, teasing, and dance-floor enforcement",

  /* The nephews and nieces, who have appointed themselves the welcome
     committee. They call Akshay "mama". */
  kids: ["Saksham", "Shreeyan", "Pradyot", "Prahalya",
         "Vrushabh", "Vidwat", "Padmaraj", "Prajyoti"],
  kidsLine: "आमच्या मामाचं लग्न आहे!",
  kidsLineEn: "It's our mama's wedding — you're coming, no?",
  kidsRole: "Official welcome committee · haldi division",

  /* The akshata moment — the muhurat itself. The live ceremony for
     guests joining from afar fires off exactly this timestamp. */
  weddingISO: "2026-08-09T12:00:00+05:30",
  muhurtLabel: "Akshata · 12:00 PM",

  /* THE VENUE — how we describe it vs. how devices navigate to it.
     Google files this pin under the neighbouring village "Gavani", but
     the place everyone knows is Smt. Malini Patil Bhavan up on Tavandi
     hill (Shri Kshetra Stavanidhi). So: we show OUR wording everywhere,
     and every link points at the exact pin or its coordinates — never
     a text search, which could send someone to the wrong village. */
  venue: {
    name: "Smt. Malini Patil Bhavan",
    area: "Tavandi Hill · Shri Kshetra Stavanidhi",
    district: "Belagavi district, Karnataka 591237",
    maps: "https://maps.app.goo.gl/GxjJJJymxGeagx9YA",
    lat: 16.3581223,
    lng: 74.4080518,
    /* universal fallback: works in Google Maps, Apple Maps, Ola, Uber —
       anything that accepts a coordinate. */
    geo: "16.3581223,74.4080518",
    plusCode: "9C55+66V",
    note: "Up on Tavandi. Ample parking at the top; dining hall on the ground floor, main hall one floor up.",
    /* shown near the map links so nobody panics mid-journey */
    aliasNote: "Your map app may show this area as ‘Gavani’ — that's the same place. Follow the pin.",
  },
  city: "Tavandi · Shri Kshetra Stavanidhi",

  /* ✏️ TODO: real number before sending this out. */
  contact: "RSVP · +91 8197 667789 (Nishchay Bankapure)",

  /* ── LIVE STREAM ────────────────────────────────────────────
     Paste your Google Meet or YouTube Live link here.

     Honest constraint: Google Meet CANNOT be embedded in a web page —
     Google blocks it with an X-Frame-Options header, and there is no way
     around that. So if you paste a Meet link the invitation shows a big
     "Join the live stream" button that opens Meet properly (in the app on
     phones). If you paste a YouTube Live link instead, it plays embedded
     right inside the invitation, which is the nicer experience and has no
     participant cap.
     Leave url empty to hide the whole thing. */
  stream: {
    /* Leave EMPTY. Set the real link on the day from /admin → Live stream,
       so it can be changed without a redeploy. Your Meet room, if you want
       it instead of YouTube: https://meet.google.com/mui-fnhr-ewm */
    url: "",
    label: "Join the akshata muhurat, live",
    note: "Sunday 9 August · 12:00–12:30 PM IST. Join a few minutes early and please stay on mute.",
  },

  /* The real Google Calendar event, so guests get YOUR entry (with the
     Meet link inside it) rather than one this site generates. */
  calendarUrl: "https://calendar.app.google/ahBBGYZDi4c6KY7GA",

  giftNote: "Your presence is the gift.",
  giftSub: "No gifts, please — we mean it. Come, eat well, bless us, dance a little.",
};

/* One day. Only the rituals that matter. */
export const EVENTS = [
  {
    id: "bhastgi", emoji: "🌸", title: "Bhastgi",
    tag: "The day opens here",
    date: "2026-08-09", start: "08:30", end: "09:30",
    place: "Smt. Malini Patil Bhavan · Tavandi",
    dress: "Traditional. Come as you'd like to be photographed.",
  },
  {
    id: "haldi", emoji: "🪔", title: "Haldi",
    tag: "Turmeric, laughter, ruined clothes",
    date: "2026-08-09", start: "09:30", end: "11:00",
    place: "Smt. Malini Patil Bhavan · Tavandi",
    dress: "Something you're happy to sacrifice to haldi. Yellow earns bonus points.",
  },
  {
    id: "akshata", emoji: "💍", title: "Akshata",
    tag: "The antarpat drops. This is the moment.",
    date: "2026-08-09", start: "12:00", end: "13:00",
    place: "Smt. Malini Patil Bhavan · Main hall (first floor)",
    dress: "Sarees & kurtas. Nauvari and saaj always welcome.",
  },
  {
    id: "bhojan", emoji: "🍛", title: "Bhojan",
    tag: "Lunch at the venue. Come hungry.",
    /* ✏️ Lunch timing assumed to follow the akshata — adjust if the
       kitchen has a different plan. */
    date: "2026-08-09", start: "13:00", end: "15:30",
    place: "Smt. Malini Patil Bhavan · Dining hall (ground floor)",
    dress: "Loose. Trust us.",
  },
];

/* The rituals of the day, in order. Digambar Jain — no Ganesh puja. */
export const RITUAL_CHIPS = [
  "Bhastgi", "Haldi", "Dev Darshan", "Navkar Mantra", "Antarpat", "Mangalashtak", "Akshata", "Aashirwad", "Bhojan",
];

/* Bilingual phrases — each shown with its meaning, never as wordplay.
   mr = Marathi · kn = Kannada */
export const PHRASES = [
  { txt: "सुस्वागतम्", lang: "mr", mean: "welcome" },
  { txt: "ಸುಸ್ವಾಗತ", lang: "kn", mean: "welcome" },
  { txt: "हळू हळू", lang: "mr", mean: "slowly, slowly" },
  { txt: "येता का मग?", lang: "mr", mean: "so, you're coming?" },
  { txt: "ಬನ್ನಿ", lang: "kn", mean: "do come" },
  { txt: "जेवण झालं का?", lang: "mr", mean: "have you eaten?" },
  { txt: "ಊಟ ಆಯ್ತಾ?", lang: "kn", mean: "have you eaten?" },
  { txt: "शुभमंगल सावधान", lang: "mr", mean: "the auspicious moment — be present" },
];

export const VIBES = [
  { id: "yes", emoji: "🙌", title: "Yes, all of it", sub: "Bhastgi at 8:30 through to the last laddoo." },
  { id: "akshata", emoji: "💍", title: "Akshata & bhojan", sub: "There for the 12 o'clock moment, and lunch." },
  { id: "short", emoji: "🌸", title: "Blessings, then off", sub: "In, blessed, photographed, gone." },
  { id: "afar", emoji: "💛", title: "Wishing from afar", sub: "Can't travel — sending love and blessings." },
];

export const MEALS = ["Jain (no kanda-lasun)", "Regular veg"];

export const SEED_BLESSINGS = [
  { id: "s1", txt: "Two families, one very happy day. Blessings to you both. 🪔", who: "Bankapure kaka" },
  { id: "s2", txt: "सुखी संसार होवो! 🌸", who: "Sangave aatya" },
  { id: "s3", txt: "See you up on Tavandi. Save us a seat near the food. 🍛", who: "Pune cousins" },
];

export const PINS = [
  { id: "venue", label: "Smt. Malini Patil Bhavan", km: "Tavandi Hill · Shri Kshetra Stavanidhi",
    q: null,   // never search by text — use the exact pin (see CONFIG.venue.maps)
    note: "Up on Tavandi. Ample parking at the top; dining hall downstairs, main hall upstairs." },
  { id: "ixg", label: "Belagavi Airport (IXG)", km: "Nearest airport", q: "Belagavi Airport IXG" },
  { id: "kop", label: "Kolhapur", km: "Nearest big city on the Maharashtra side", q: "Kolhapur Maharashtra" },
  { id: "nippani", label: "Nippani", km: "Closest town for last-minute anything", q: "Nippani Karnataka" },
];

export const GUIDE = {
  pravaas: [
    ["Fly", "Belagavi Airport (IXG) is the nearest. Kolhapur airport also works."],
    ["Train", "Ghataprabha / Kudchi and Miraj are the usable railheads; road the rest of the way."],
    ["Drive", "Off the Pune–Bengaluru NH-48 corridor near Nippani, then up to Stavanidhi. Easiest way in."],
    ["At the venue", "It's up Tavandi hill — plenty of parking at the top."],
  ],
  pehnava: [
    ["Haldi", "Old clothes. Turmeric does not negotiate."],
    ["Vivah", "Sarees & kurtas. Nauvari and Kolhapuri saaj always look right."],
    ["Weather", "August in this belt means sudden rain. Umbrella in the bag, chappals with grip."],
  ],
  khaana: [
    ["Bhojan", "Lunch is served at the venue, ground floor. Pure veg."],
    ["Jain thali", "Available — just mark it in your RSVP so the kitchen knows."],
    ["Belagavi Kunda", "If you're passing through Belagavi, buy some. Thank us later."],
  ],
  insider: [
    ["Stairs", "Main hall is one floor up. Tell us in advance if anyone needs help with stairs."],
    ["Stavanidhi", "The hill is a Digambar Jain kshetra — worth the darshan while you're up there."],
    ["Halu halu", "Means 'slowly' in both Marathi and Kannada. The day's only speed limit."],
    ["No gifts", "Genuinely. Your presence is the whole gift."],
  ],
};

/* The acts of the single continuous flight. */
/* Seven sections. `key` maps to the translation dictionary in lib/i18n. */
export const ACTS = [
  { id: "antarpat",  key: "navAntarpat" },
  { id: "parivar",   key: "navParivar" },
  { id: "ashirwad",  key: "navAshirwad" },
  { id: "muhurat",   key: "navMuhurat" },
  { id: "rasta",     key: "navRasta" },
  { id: "yeta",      key: "navYeta" },
  { id: "wall",      key: "navWall" },
];
