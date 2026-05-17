import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { TacticalCursor } from "@/components/TacticalCursor";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gerard Llanas Conesa — Full Stack Developer",
  description:
    "Interactive developer progression portfolio. Scroll to explore Gerard Llanas' career journey, skills and milestones as a gamified XP-based experience.",
  openGraph: {
    title: "Gerard Llanas Conesa — Full Stack Developer",
    description:
      "Interactive developer progression portfolio. Scroll to explore my career journey, skills and milestones.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gerard Llanas Conesa — Full Stack Developer",
    description:
      "Interactive developer progression portfolio. Scroll to explore my career journey, skills and milestones.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <TacticalCursor />
        <Header />
        {children}
      </body>
    </html>
  );
}
