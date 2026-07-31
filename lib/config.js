/* Central content & settings — every name, date, venue, phone number
   and story beat for the invite lives in this one file. */


/* ════════════════════════════════════════════════════════════════════
   ✏️  EDIT ME — every name, date, venue and phone number lives here.
   ════════════════════════════════════════════════════════════════════ */
export const CONFIG = {
  groom: {
    en: "Akshay", dev: "अक्षय", kan: "ಅಕ್ಷಯ್", surname: "Bankapure",
    family: "the Bankapure parivaar, Belagavi",
    parents: "Son of Smt. Rupali Bankapure & Late Shri Ashok Bankapure",
  },
  bride: {
    en: "Shraddha", dev: "श्रद्धा", kan: "ಶ್ರದ್ಧಾ", surname: "Sangave",
    family: "the Sangave parivaar, Kolhapur",
    // ✏️ TODO: when ready, append " & Late Smt. <aai's name> Sangave" below
    parents: "Daughter of Shri Babaso Sangave",
  },
  /* Heavenly blessings — shown in the footer.
     ✏️ TODO: add Shraddha's late aai's name as a second entry, e.g.
     "कै. सौ. ______ सांगवे · Late Smt. ______ Sangave" */
  remembrance: ["कै. श्री. अशोक बंकापुरे · Late Shri Ashok Bankapure"],
  siblings: "Nishchay · Shweta & Pramod Khot · Divya & Sharad Tirth",
  familiesLine: "Bankapure · Magadum · Khot · Tirth × Sangave",
  hashtag: "#AkshayWedsShraddha",
  weddingISO: "2026-08-09T11:47:00+05:30", // Shubh Muhurat
  muhurtLabel: "Shubh Muhurat · 11:47 AM",
  city: "Belagavi, Karnataka",
  venue: {
    name: "Shri Mangal Lawns",
    line: "Fort Road, Belagavi 590016",
    mapsQuery: "Shri Mangal Lawns Fort Road Belagavi",
  },
  hotel: "Hotel Sankam Residency (say “Shraddha–Akshay shaadi” for the blocked rate)",
  contact: "RSVP helpline · +91 98XXX XXXXX (Nishchay — the groom's bhau & unofficial event manager)",
};

export const EVENTS = [
  {
    id: "haldi", emoji: "🪔", title: "Haldi", tag: "Turmeric threat level: maximum",
    date: "2026-08-07", start: "10:00", end: "13:00", place: "Bankapure Residence courtyard",
    dress: "Anything you're ready to sacrifice to haldi. Yellow earns bonus points.",
    note: "Ukhaane optional, giggling mandatory.",
  },
  {
    id: "mehendi", emoji: "🌿", title: "Mehendi", tag: "Free hand-art. Patience required.",
    date: "2026-08-07", start: "16:00", end: "20:00", place: "Shri Mangal Lawns · Garden wing",
    dress: "Greens & pastels. Sleeves you can roll up.",
    note: "Chaha + kanda bhaji on loop (it's monsoon, obviously).",
  },
  {
    id: "sangeet", emoji: "💃", title: "Sangeet", tag: "Lavani vs. bhajan-remix dance-off",
    date: "2026-08-08", start: "19:00", end: "23:30", place: "Shri Mangal Lawns · Main hall",
    dress: "Sparkle. The DJ has been warned about 'Nad Khula'.",
    note: "Both aajis have rehearsed. Nobody is safe.",
  },
  {
    id: "phere", emoji: "🐎", title: "Baraat · Granthi Bandhan · Phere", tag: "The main event",
    date: "2026-08-09", start: "09:30", end: "12:30", place: "Shri Mangal Lawns · Mandap",
    dress: "Sarees & kurtas. Nauvari + Kolhapuri saaj = front-row respect.",
    note: "Mangalashtak at full family volume. Akshata will fly. Muhurat 11:47 AM sharp-ish.",
  },
  {
    id: "bhojan", emoji: "🍛", title: "Grand Jain Bhojan", tag: "Kanda-lasun free. Flavor overloaded.",
    date: "2026-08-09", start: "12:30", end: "15:00", place: "Shri Mangal Lawns · Bhojan hall",
    dress: "Elastic waistbands are a valid cultural choice.",
    note: "Unlimited jilebi. Shudh ghee. Zero compromise.",
  },
  {
    id: "reception", emoji: "✨", title: "Reception", tag: "Kolhapuri spice meets Belagavi sweet",
    date: "2026-08-09", start: "19:00", end: "22:30", place: "Shri Mangal Lawns · Lawns",
    dress: "Smart festive. Kolhapuri chappals are dance-floor legal.",
    note: "Belagavi Kunda counter closes only when the Kunda does.",
  },
];

export const STORY = [
  {
    y: "Once upon…", t: "Two kids, 120 km apart",
    sweet: "One home began mornings with the Navkar Mantra; the other with aarti and a shamelessly loud bell. Both agreed on the essentials: Sundays mean sheera.",
    spice: "He was the topper who feared haldi stains on his notebooks. She once traded homework answers for an extra pedha. Balance.",
  },
  {
    y: "2019", t: "The Misal Summit, Kolhapur",
    sweet: "She asked for extra tarri. He asked for “Jain misal, no kanda-lasun.” The waiter needed a moment of silence. So did he — she was laughing at him already.",
    spice: "She judged his spice tolerance for exactly eleven seconds, then decided to marry it into shape.",
  },
  {
    y: "2019–24", t: "Long distance, short patience",
    sweet: "Pune ↔ Bengaluru. 4,217 video calls (approx.), two train apps, one shared playlist titled “halu halu”.",
    spice: "NH-48 has witnessed more of this love story than both families combined.",
  },
  {
    y: "2025", t: "The Yes ×2",
    sweet: "He asked in Marathi. Then again in Kannada, for the Belagavi quorum. She said “Ho!” and “Howdu!” — motion passed unanimously.",
    spice: "The ring was insured. The knees, tragically, were not.",
  },
  {
    y: "2026", t: "Sweets were exchanged",
    sweet: "Belagavi Kunda met Kolhapur pedha. Two families, one sugar rush, zero regrets.",
    spice: "Both aajis are now locked in a silent, ghee-based arms race. Guests win either way.",
  },
];

export const RITUAL_CHIPS = [
  "Navkar Mantra opening", "Mangalashtak — full family volume", "Antarpat & Akshata",
  "Granthi Bandhan", "Saat Phere", "Aashirwad + one enormous group photo",
];

export const VIBES = [
  { id: "dance", emoji: "🕺", title: "Nachnaar. Nad khula!", sub: "On the floor till 2 AM. DJ, brace yourself." },
  { id: "food", emoji: "🍛", title: "Fakt jevayla yenar", sub: "Mainly here for the jevan. Honestly? Respect." },
  { id: "phere", emoji: "🌸", title: "Phere-only professional", sub: "Muhurat, blessings, 400 photos, home by nap time." },
  { id: "afar", emoji: "💛", title: "Wishing from afar", sub: "Can't make it — sending love. Laddoo courier expected." },
];
export const MEALS = ["Jain (no kanda-lasun)", "Regular veg", "Kolhapuri teekha 🌶️"];

export const SEED_BLESSINGS = [
  { n: "Aaji", m: "Eat first, dance later. This is not a suggestion. 🙏", c: 0 },
  { n: "Prakash Kaka", m: "ಶುಭಾಶಯಗಳು! Lai bhari jodi. Border-city approved. 🪔", c: 1 },
  { n: "Cousin Rohan", m: "May your Wi-Fi be strong and your arguments short. ❤️", c: 2 },
  { n: "Magadum Kaku", m: "May your love be like Kunda — slow-cooked, rich, impossible to stop at one serving. 🍯", c: 3 },
];

export const PINS = [
  { id: "venue", x: 300, y: 240, icon: "★", label: "Shri Mangal Lawns", sub: "The venue · Fort Road, Belagavi", km: "You are needed here", q: CONFIG.venue.mapsQuery },
  { id: "air", x: 150, y: 140, icon: "✈", label: "Belagavi Airport (IXG)", sub: "Sambra · direct from BLR, BOM, HYD", km: "≈ 10 km from venue", q: "Belagavi Airport" },
  { id: "rail", x: 330, y: 330, icon: "🚉", label: "Belagavi Railway Stn", sub: "Rani Chennamma Exp fans, this is you", km: "≈ 4 km from venue", q: "Belagavi Railway Station" },
  { id: "gokak", x: 565, y: 130, icon: "💧", label: "Gokak Falls", sub: "August = full monsoon flow. Go.", km: "≈ 60 km · day trip", q: "Gokak Falls" },
  { id: "kolhapur", x: 645, y: 385, icon: "🛕", label: "Kolhapur", sub: "Mahalaxmi darshan, Rankala katta, chappal shopping", km: "≈ 2.5 hrs by road", q: "Mahalaxmi Temple Kolhapur" },
  { id: "fort", x: 470, y: 280, icon: "🏰", label: "Belagavi Fort & Kamal Basadi", sub: "12th-century Jain basadi inside the fort", km: "≈ 3 km · morning walk", q: "Kamal Basadi Belagavi Fort" },
];

export const GUIDE = {
  khaana: [
    ["Belagavi Kunda", "Caramelised-milk magic. Buy two kilos. Thank us later."],
    ["Mande", "Paper-thin, ghee-soaked sweet. Eaten with both hands and no dignity."],
    ["Karadantu (Gokak)", "Edible souvenir. Survives flights, never survives the week."],
    ["Misal", "Order 'medium' unless you've trained. 'Extra tarri' is a lifestyle."],
    ["Cutting chai + kanda bhaji", "Monsoon's official pairing. Non-negotiable in August."],
  ],
  pehnava: [
    ["Haldi", "Old kurta you can donate to turmeric. White = brave."],
    ["Sangeet", "Sparkle first, comfort second — or Kolhapuri chappals and both."],
    ["Wedding", "Sarees & kurtas. Nauvari + saaj = front-row respect at the mandap."],
    ["Reception", "Smart festive. August drizzle is romantic; soggy mojaris are not — carry an umbrella."],
  ],
  pravaas: [
    ["Fly", "Belagavi Airport (IXG), ~25 min away. Kolhapur airport works too."],
    ["Train", "Rani Chennamma Express from Bengaluru does the overnight classic."],
    ["Drive", "Pune → Belagavi ≈ 5–6 hrs on NH-48. Ghat-section selfies are mandatory."],
    ["Stay", CONFIG.hotel],
  ],
  insider: [
    ["Learn two phrases", "“Lai bhari!” (Marathi) and “Bhaari chennagide!” (Kannada). Instant family."],
    ["“Jevan zala ka?”", "It's a greeting, not a catering audit. Correct answer: smile, say ho, eat again."],
    ["Halu halu", "Means 'slowly' in Marathi and Kannada. The only speed limit this weekend."],
    ["Monsoon rule", "Umbrella in bag, chappals with grip, heart fully open."],
  ],
};

/* ── tiny utilities ─────────────────────────────────────────────── */
export const CHAPTERS = [
  ["home", "Antarpat"], ["story", "Katha"], ["events", "Muhurat"],
  ["venue", "Rasta"], ["rsvp", "Yeta ka?"], ["wall", "Ashirwad"],
];

