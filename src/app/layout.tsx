import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TakedownPro - Christmas Light Takedown Optimizer",
  description: "Streamline your Christmas light takedown season with optimized routes, crew management, inventory tracking, and real-time status updates. Integrates with Jobber.",
  keywords: ["christmas lights", "takedown", "removal", "route optimization", "crew management", "jobber integration"],
  authors: [{ name: "Brandon Calloway" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TakedownPro",
  },
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    type: "website",
    siteName: "TakedownPro",
    title: "TakedownPro - Christmas Light Takedown Optimizer",
    description: "Streamline your Christmas light takedown season with optimized routes and real-time tracking.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "TakedownPro",
    description: "Streamline your Christmas light takedown season",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#dc2626',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
