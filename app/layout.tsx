import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "Kafe Singgah Sana",
  description: "Tempah meja atau order dari meja anda di Kafe Singgah Sana, Rembau.",
};

export const viewport: Viewport = {
  themeColor: "#3b2616",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const fonts = geistSans.variable + " " + geistMono.variable + " " + playfair.variable;
  return (
    <html lang="ms" className={fonts + " h-full antialiased"}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}