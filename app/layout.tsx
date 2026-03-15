import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, EB_Garamond } from "next/font/google"
import "./globals.css"
import LayoutWrapper from "@/components/layout-wrapper"
import CookieConsent from "@/components/cookie-consent"
import { PWARegister } from "@/components/pwa-register"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const ebGaramond = EB_Garamond({ subsets: ["latin"], variable: "--font-eb-garamond" })

export const viewport: Viewport = {
  themeColor: "#F9D57E",
}

export const metadata: Metadata = {
  title: "ALTAR - Divine Technology for Sacred Living",
  description:
    "Transform your spiritual journey with ALTAR's divine technology. Capture revelations, organize sacred tasks, and deepen your faith through intelligent spiritual guidance.",
  keywords:
    "spiritual app, faith technology, prayer journal, divine guidance, sacred productivity, Christian app, spiritual growth, faith-based planning",
  authors: [{ name: "ALTAR Team" }],
  creator: "ALTAR",
  publisher: "ALTAR",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://altar-app.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ALTAR - Divine Technology for Sacred Living",
    description:
      "Transform your spiritual journey with ALTAR's divine technology. Capture revelations, organize sacred tasks, and deepen your faith.",
    url: "https://altar-app.com",
    siteName: "ALTAR",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ALTAR - Divine Technology for Sacred Living",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ALTAR - Divine Technology for Sacred Living",
    description: "Transform your spiritual journey with ALTAR's divine technology.",
    images: ["/twitter-image.jpg"],
    creator: "@altar_app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  generator: "v0.app",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ALTAR",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${ebGaramond.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-cream via-white to-sage/10">
        <LayoutWrapper>{children}</LayoutWrapper>
        <CookieConsent />
        <PWARegister />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
