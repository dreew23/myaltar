import type { Metadata } from "next"
import ProductHero from "@/components/product/product-hero"
import ProductFeatures from "@/components/product/product-features"
import ProductComparison from "@/components/product/product-comparison"
import ProductSocialProof from "@/components/product/product-social-proof"
import ProductObjectionHandler from "@/components/product/product-objection-handler"
import ProductDemo from "@/components/product/product-demo"
import ProductPricing from "@/components/product/product-pricing"
import ProductTestimonials from "@/components/product/product-testimonials"
import ProductCTA from "@/components/product/product-cta"
import MetaMaskErrorHandler from "@/components/metamask-error-handler"
import ExtensionConflictHandler from "@/components/extension-conflict-handler"

export const metadata: Metadata = {
  title: "Product - ALTAR Sacred Planning Platform | Divine-Guided Productivity",
  description:
    "Discover ALTAR's powerful features for spiritual planning, prayer tracking, scripture integration, and divine-guided productivity. Transform your daily routine into sacred practice.",
  keywords:
    "spiritual planning software, prayer tracking app, scripture integration, divine productivity, faith-based planning, morning devotions app",
}

export default function ProductPage() {
  return (
    <main className="min-h-screen bg-[#FDFCF9]">
      <MetaMaskErrorHandler />
      <ExtensionConflictHandler />
      <ProductHero />
      <ProductSocialProof />
      <ProductFeatures />
      <ProductComparison />
      <ProductObjectionHandler />
      <ProductDemo />
      <ProductPricing />
      <ProductTestimonials />
      <ProductCTA />
    </main>
  )
}
