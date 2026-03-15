"use client"

import { Suspense, useState } from "react"
import FeaturesHero from "@/components/features/features-hero"
import FeaturesCategories from "@/components/features/features-categories"
import EnhancedFeaturesShowcase from "@/components/features/enhanced-features-showcase"
import FeaturesTestimonials from "@/components/features/features-testimonials"
import FeaturesCTA from "@/components/features/features-cta"
import MobileComparisonTable from "@/components/features/mobile-comparison-table"
import FeaturesNavigation from "@/components/features/features-navigation"
import SpiritualAssessmentQuiz from "@/components/features/spiritual-assessment-quiz"

interface FeatureFilters {
  complexity: "all" | "beginner" | "intermediate" | "advanced"
  category: "all" | "planning" | "spiritual" | "community" | "devotional"
  spiritualFocus: "all" | "prayer" | "scripture" | "growth" | "service"
}

export default function FeaturesClientPage() {
  const [showQuiz, setShowQuiz] = useState(false)
  const [personalizedFeatures, setPersonalizedFeatures] = useState<string[]>([])
  const [currentSection, setCurrentSection] = useState("hero")
  const [filters, setFilters] = useState<FeatureFilters>({
    complexity: "all",
    category: "all",
    spiritualFocus: "all",
  })
  const [searchQuery, setSearchQuery] = useState("")

  const handleQuizComplete = (recommendations: string[]) => {
    setPersonalizedFeatures(recommendations)
    setShowQuiz(false)
    document.getElementById("features-categories")?.scrollIntoView({ behavior: "smooth" })
  }

  const handleFilterChange = (newFilters: FeatureFilters) => {
    setFilters(newFilters)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <main className="min-h-screen bg-[#FDFCF9]">
      <FeaturesNavigation
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
      />

      <div id="features-hero">
        <FeaturesHero onStartQuiz={() => setShowQuiz(true)} />
      </div>

      <div id="features-categories">
        <FeaturesCategories filters={filters} searchQuery={searchQuery} personalizedFeatures={personalizedFeatures} />
      </div>

      <div id="features-showcase">
        <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
          <EnhancedFeaturesShowcase />
        </Suspense>
      </div>

      <div id="features-comparison">
        <MobileComparisonTable />
      </div>

      <div id="features-testimonials">
        <FeaturesTestimonials />
      </div>

      <div id="features-cta">
        <FeaturesCTA />
      </div>

      {showQuiz && <SpiritualAssessmentQuiz onComplete={handleQuizComplete} onClose={() => setShowQuiz(false)} />}
    </main>
  )
}
