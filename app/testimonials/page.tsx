import type { Metadata } from "next"
import TestimonialsHero from "@/components/testimonials/testimonials-hero"
import FeaturedTestimonials from "@/components/testimonials/featured-testimonials"
import VideoTestimonials from "@/components/testimonials/video-testimonials"
import TestimonialCategories from "@/components/testimonials/testimonial-categories"
import TestimonialStats from "@/components/testimonials/testimonial-stats"
import TestimonialWall from "@/components/testimonials/testimonial-wall"
import TestimonialsCTA from "@/components/testimonials/testimonials-cta"
import TrustSignals from "@/components/trust-signals"
import TransformationTimeline from "@/components/testimonials/transformation-timeline"
import ScriptureTestimonials from "@/components/testimonials/scripture-testimonials"
import TestimonialMap from "@/components/testimonials/testimonial-map"
import TestimonialSubmission from "@/components/testimonials/testimonial-submission"
import SocialTestimonials from "@/components/testimonials/social-testimonials"
import VoiceTestimonials from "@/components/testimonials/voice-testimonials"
import SeasonalTestimonials from "@/components/testimonials/seasonal-testimonials"
import StickyCTA from "@/components/testimonials/sticky-cta"

export const metadata: Metadata = {
  title: "Sacred Stories | ALTAR Testimonials - Real Women, Real Transformation",
  description:
    "Discover how 8,000+ women have transformed their spiritual lives with ALTAR. Read authentic testimonials about divine-guided planning, prayer breakthroughs, and sacred morning routines.",
  keywords:
    "ALTAR testimonials, spiritual transformation stories, divine guidance testimonials, prayer app reviews, Christian planning testimonials, spiritual growth stories",
  openGraph: {
    title: "Sacred Stories | ALTAR Testimonials",
    description: "Real women sharing how ALTAR transformed their spiritual journey and daily walk with God.",
    url: "https://altar.app/testimonials",
    images: [
      {
        url: "/testimonials/testimonials-hero.jpg",
        width: 1200,
        height: 630,
        alt: "ALTAR Testimonials - Sacred Stories of Transformation",
      },
    ],
  },
}

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBF8F3] via-white to-[#FBF8F3]">
      {/* Hero Section */}
      <TestimonialsHero />

      {/* Trust Signals */}
      <TrustSignals />

      {/* Testimonial Statistics */}
      <TestimonialStats />

      {/* Featured Testimonials with Before/After */}
      <FeaturedTestimonials />

      {/* Transformation Timeline */}
      <TransformationTimeline />

      {/* Enhanced Video Testimonials */}
      <VideoTestimonials />

      {/* Scripture-Based Testimonials */}
      <ScriptureTestimonials />

      {/* Testimonial Categories */}
      <TestimonialCategories />

      {/* Interactive Testimonial Map */}
      <TestimonialMap />

      {/* Social Media Testimonials */}
      <SocialTestimonials />

      {/* Voice Testimonials */}
      <VoiceTestimonials />

      {/* Seasonal Testimonials */}
      <SeasonalTestimonials />

      {/* Testimonial Wall */}
      <TestimonialWall />

      {/* Testimonial Submission */}
      <TestimonialSubmission />

      {/* Call to Action */}
      <TestimonialsCTA />

      {/* Sticky CTA */}
      <StickyCTA />
    </div>
  )
}
