import "./globals.css";
/* Self-hosted fonts via Fontsource (npm) — no Google Fonts runtime calls,
   no build-time network fetch. Family names land on the --font-* variables
   defined at the top of globals.css. */
import "@fontsource-variable/fraunces";
import "@fontsource-variable/sora";
import "@fontsource/tiro-devanagari-marathi";
import "@fontsource-variable/noto-sans-kannada";

export const metadata = {
  metadataBase: new URL("http://localhost:3000"), // ✏️ change to your real domain on deploy
  title: "Akshay ♥ Shraddha — 09.08.2026",
  description:
    "Bankapure × Sangave · Belagavi × Kolhapur · Haldi, Mehendi, Sangeet, Phere & one very busy Aaji. Yeta ka mag?",
  openGraph: {
    title: "Akshay ♥ Shraddha — 09.08.2026",
    description: "Two traditions, two languages, one lai bhari love story. You're invited to all of it.",
    images: ["/img/og-invite.png"],
  },
};

export const viewport = { themeColor: "#0a0e24", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
