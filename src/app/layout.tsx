import type { Metadata } from "next";
import {
  Barlow_Condensed,
  Cinzel,
  Cormorant_Garamond,
  EB_Garamond,
  Spectral,
} from "next/font/google";
import { MetaPixel } from "@/components/meta-pixel";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-eb-garamond",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-cinzel",
  display: "swap",
});

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-spectral",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ThroneEra",
  description: "Interactive reign campaigns with choices the world remembers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://creem.io" />
        <link rel="dns-prefetch" href="https://creem.io" />
        <link rel="preconnect" href="https://www.creem.io" />
        <link rel="dns-prefetch" href="https://www.creem.io" />
      </head>
      <body
        className={`${cormorant.variable} ${ebGaramond.variable} ${cinzel.variable} ${spectral.variable} ${barlowCondensed.variable}`}
      >
        <MetaPixel pixelId={process.env.META_PIXEL_ID} />
        {children}
      </body>
    </html>
  );
}
