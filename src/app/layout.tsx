import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
