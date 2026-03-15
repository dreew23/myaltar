import type { Metadata } from "next"
import FeaturesClientPage from "./features-client-page"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Features - ALTAR | Divine-Guided Planning & Spiritual Growth Tools",
  description:
    "Explore ALTAR's powerful features for prayer tracking, scripture integration, divine-guided planning, and spiritual growth. Transform your daily routine into sacred practice.",
  keywords:
    "spiritual planning features, prayer tracking, scripture integration, divine productivity, faith-based planning, morning devotions, spiritual growth tools",
}

export default function FeaturesPage() {
  return <FeaturesClientPage />
}
