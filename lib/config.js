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
    // ✏️ TODO: append " & Late Smt. ______ Sangave" once the name is confirmed
    parents: "Daughter of Shri Babaso Sangave",
    siblings: "",
  },

  /* Heavenly blessings — footer. ✏️ TODO: add Shraddha's late aai here,
     format: "कै. सौ. ______ सांगवे · Late Smt. ______ Sangave" */
  remembrance: ["कै. श्री. अशोक बंकापुरे · Late Shri Ashok Bankapure"],
  familiesLine: "Bankapure · Magadum · Khot · Tirth  ×  Sangave",
  hashtag: "#AkshayWedsShraddha",

  /* ✏️ TODO: replace with the real muhurat once the panchang is set. */
  weddingISO: "2026-08-09T11:47:00+05:30",
  muhurtLabel: "Shubh Muhurat · 11:47 AM",

  venue: {
    name: "Smt. Malini Patil Bhavan",
    area: "Gavani, Belagavi district, Karnataka 591237",
    maps: "https://maps.app.goo.gl/GxjJJJymxGeagx9YA",
    q: "SMT. MALINI PATIL BHAVAN Gavani Karnataka",
    /* From the venue itself — genuinely useful for guests */
    note: "On a hill with ample parking. Dining hall on the ground floor, main hall one floor up.",
  },
  city: "Gavani, Belagavi",

  /* ✏️ TODO: real number before sending this out. */
  contact: "RSVP · +91 98XXX XXXXX (Nishchay Bankapure)",

  giftNote: "Your presence is the gift.",
  giftSub: "No gifts, please — we mean it. Come, eat well, bless us, dance a little.",
};

/* One day. Only the rituals that matter. */
export const EVENTS = [
  {
    id: "haldi", emoji: "🪔", title: "Haldi",
    tag: "Turmeric, laughter, ruined clothes",
    date: "2026-08-09", start: "09:00", end: "10:30",
    place: "Smt. Malini Patil Bhavan",
    dress: "Something you're happy to sacrifice to haldi. Yellow earns bonus points.",
  },
  {
    id: "vivah", emoji: "💍", title: "Vivah Sohala",
    tag: "The antarpat drops. This is the one.",
    date: "2026-08-09", start: "11:00", end: "12:30",
    place: "Smt. Malini Patil Bhavan · Main hall (first floor)",
    dress: "Sarees & kurtas. Nauvari and saaj always welcome.",
  },
  {
    id: "bhojan", emoji: "🍛", title: "Bhojan",
    tag: "Lunch at the venue. Come hungry.",
    date: "2026-08-09", start: "12:30", end: "15:00",
    place: "Smt. Malini Patil Bhavan · Dining hall (ground floor)",
    dress: "Loose. Trust us.",
  },
];

/* The rituals of the day, in order. */
export const RITUAL_CHIPS = [
  "Haldi", "Ganesh Puja", "Antarpat", "Mangalashtak", "Saat Phere", "Aashirwad", "Bhojan",
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
  { id: "yes", emoji: "🙌", title: "Yes, all of it", sub: "Haldi, phere, bhojan. The full day." },
  { id: "vivah", emoji: "💍", title: "Vivah & bhojan", sub: "There for the muhurat and lunch." },
  { id: "short", emoji: "🌸", title: "Blessings, then off", sub: "In, blessed, photographed, gone." },
  { id: "afar", emoji: "💛", title: "Wishing from afar", sub: "Can't travel — sending love and blessings." },
];

export const MEALS = ["Jain (no kanda-lasun)", "Regular veg"];

export const SEED_BLESSINGS = [
  { id: "s1", txt: "Two families, one very happy day. Blessings to you both. 🪔", who: "Bankapure kaka" },
  { id: "s2", txt: "सुखी संसार होवो! 🌸", who: "Sangave aatya" },
  { id: "s3", txt: "See you on the hill in Gavani. Save us a seat near the food. 🍛", who: "Pune cousins" },
];

export const PINS = [
  { id: "venue", label: "Smt. Malini Patil Bhavan", km: "Gavani · the whole day happens here",
    q: "SMT. MALINI PATIL BHAVAN Gavani Karnataka",
    note: "On a hill, ample parking. Dining hall downstairs, main hall upstairs." },
  { id: "ixg", label: "Belagavi Airport (IXG)", km: "Nearest airport", q: "Belagavi Airport IXG" },
  { id: "kop", label: "Kolhapur", km: "Nearest big city on the Maharashtra side", q: "Kolhapur Maharashtra" },
  { id: "nippani", label: "Nippani", km: "Closest town for last-minute anything", q: "Nippani Karnataka" },
];

export const GUIDE = {
  pravaas: [
    ["Fly", "Belagavi Airport (IXG) is the nearest. Kolhapur airport also works."],
    ["Train", "Ghataprabha / Kudchi and Miraj are the usable railheads; road the rest of the way."],
    ["Drive", "Right off the Pune–Bengaluru NH-48 corridor, near Nippani. Easiest way in."],
    ["At the venue", "It's up a hill — there's plenty of parking at the top."],
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
    ["Halu halu", "Means 'slowly' in both Marathi and Kannada. The day's only speed limit."],
    ["No gifts", "Genuinely. Your presence is the whole gift."],
  ],
};

/* The acts of the single continuous flight. */
export const ACTS = [
  { id: "antarpat", label: "Antarpat", sub: "the curtain" },
  { id: "parivar", label: "Parivar", sub: "the families" },
  { id: "muhurat", label: "Muhurat", sub: "the day" },
  { id: "rasta", label: "Rasta", sub: "getting there" },
  { id: "yeta", label: "Yeta ka?", sub: "rsvp" },
  { id: "ashirwad", label: "Ashirwad", sub: "blessings" },
];
