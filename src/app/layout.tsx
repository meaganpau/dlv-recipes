import { Geist, Geist_Mono } from "next/font/google";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import type { Metadata } from "next";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DreamDex - Dreamlight Valley Recipes & Critters",
  description: "A collection of recipes and critters from Disney Dreamlight Valley",
  keywords: ["disney dreamlight valley", "dreamlight valley", "dreamlight valley recipes", "recipes", "critters", "gaming", "guide"],
  authors: [{ name: "Meagan Pau" }],
  creator: "Meagan Pau",
  publisher: "Meagan Pau",
  openGraph: {
    title: "DreamDex - Dreamlight Valley Recipes & Critters",
    description: "A collection of recipes and critters from Disney Dreamlight Valley",
    type: "website",
    locale: "en_US",
    siteName: "DreamDex",
  },
  twitter: {
    card: "summary_large_image",
    title: "DreamDex - Dreamlight Valley Recipes & Critters",
    description: "A collection of recipes and critters from Disney Dreamlight Valley",
    creator: "@meaganpau",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://dreamdex.meaganpau.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
