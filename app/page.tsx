import HeroSection from "@/components/hero-section"
import FlowSection from "@/components/flow-section"
import FeaturesGrid from "@/components/features-grid"
import ComparisonTable from "@/components/comparison-table"
import TestimonialsSection from "@/components/testimonials-section"
import EmailSignupSection from "@/components/email-signup-section"
import SocialProof from "@/components/social-proof"
import FAQSection from "@/components/faq-section"
import TrustSignals from "@/components/trust-signals"

export default function Page() {
  return (
    <>
      <HeroSection />
      <TrustSignals />
      <SocialProof />
      <FlowSection />
      <FeaturesGrid />
      <ComparisonTable />
      <TestimonialsSection />
      <FAQSection />
      <EmailSignupSection />
    </>
  )
}
