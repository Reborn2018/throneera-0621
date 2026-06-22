import type { Metadata } from "next";
import { MetaPixel } from "@/components/meta-pixel";
import "./globals.css";

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
      <body>
        <MetaPixel pixelId={process.env.META_PIXEL_ID} />
        {children}
      </body>
    </html>
  );
}
