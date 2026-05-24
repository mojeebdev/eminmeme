import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://enimmeme.vercel.app";

export const metadata: Metadata = {
  title: "Enim Meme Generator — enim is hot bozo, enim is him",
  description:
    "Generate savage, viral memes with Enim — the hottest bozo on the internet. Powered by AI. No sign up. Share to X instantly.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Enim Meme Generator",
    description: "enim is hot bozo. enim is him. generate your meme now 🔥",
    url: SITE_URL,
    siteName: "Enim Meme Generator",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Enim Meme Generator",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Enim Meme Generator",
    description: "enim is hot bozo. enim is him. generate your meme now 🔥",
    images: ["/og-default.jpg"],
    site: "@HotEminSummer",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    other: [
      { rel: "android-chrome-192x192", url: "/android-chrome-192x192.png" },
      { rel: "android-chrome-512x512", url: "/android-chrome-512x512.png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${lato.variable}`}>
      <head>
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <script
            defer
            src="https://cloud.umami.is/script.js"
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          />
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
