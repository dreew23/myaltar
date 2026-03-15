"use client"

import { useState, useEffect } from "react"
import { Search, Filter, BookOpen, Heart, Users, Calendar, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FeaturesNavigationProps {
  onFilterChange: (filters: FeatureFilters) => void
  onSearchChange: (query: string) => void
  currentSection: string
  onSectionChange: (section: string) => void
}

interface FeatureFilters {
  complexity: "all" | "beginner" | "intermediate" | "advanced"
  category: "all" | "planning" | "spiritual" | "community" | "devotional"
  spiritualFocus: "all" | "prayer" | "scripture" | "growth" | "service"
}

const sections = [
  { id: "hero", name: "Overview", icon: BookOpen },
  { id: "categories", name: "Categories", icon: Filter },
  { id: "showcase", name: "Highlights", icon: Heart },
  { id: "comparison", name: "Comparison", icon: Users },
  { id: "testimonials", name: "Stories", icon: Heart },
  { id: "cta", name: "Get Started", icon: Calendar },
]

const complexityLevels = [
  { id: "all", name: "All Levels", description: "Show all features" },
  { id: "beginner", name: "Beginner", description: "New to faith or ALTAR" },
  { id: "intermediate", name: "Growing", description: "Building spiritual habits" },
  { id: "advanced", name: "Advanced", description: "Mature spiritual practices" },
]

const categories = [
  { id: "all", name: "All Categories", icon: BookOpen },
  { id: "planning", name: "Sacred Planning", icon: Calendar },
  { id: "spiritual", name: "Spiritual Growth", icon: Heart },
  { id: "community", name: "Community", icon: Users },
  { id: "devotional", name: "Devotions", icon: BookOpen },
]

export default function FeaturesNavigation({
  onFilterChange,
  onSearchChange,
  currentSection,
  onSectionChange,
}: FeaturesNavigationProps) {
  const [isSticky, setIsSticky] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FeatureFilters>({
    complexity: "all",
    category: "all",
    spiritualFocus: "all",
  })

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 200)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onSearchChange(value)
  }

  const handleFilterChange = (key: keyof FeatureFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(`features-${sectionId}`)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      onSectionChange(sectionId)
    }
  }

  return (
    <>
      {/* Main Navigation */}
      <div
        className={`transition-all duration-300 ${
          isSticky ? "fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm shadow-lg" : "relative bg-white"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Section Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    currentSection === section.id
                      ? "bg-[#A7C2D7] text-white"
                      : "bg-[#FBF8F3] text-[#3C1E38] hover:bg-[#A7C2D7]/20"
                  }`}
                >
                  <section.icon className="w-4 h-4" />
                  <span className="font-inter text-sm font-medium">{section.name}</span>
                </button>
              ))}
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#3C1E38]/60" />
                <Input
                  placeholder="Search features..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 border-[#A7C2D7]/20 focus:border-[#A7C2D7]"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#3C1E38]/60 hover:text-[#3C1E38]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-[#A7C2D7]/20 hover:border-[#A7C2D7]"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 p-6 bg-[#FBF8F3] rounded-xl border border-[#A7C2D7]/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Complexity Level */}
                <div>
                  <h4 className="font-playfair font-semibold text-[#3C1E38] mb-3">Spiritual Journey Stage</h4>
                  <div className="space-y-2">
                    {complexityLevels.map((level) => (
                      <label key={level.id} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="complexity"
                          value={level.id}
                          checked={filters.complexity === level.id}
                          onChange={(e) => handleFilterChange("complexity", e.target.value)}
                          className="mt-1 text-[#A7C2D7]"
                        />
                        <div>
                          <div className="font-inter font-medium text-[#3C1E38]">{level.name}</div>
                          <div className="font-inter text-sm text-[#3C1E38]/60">{level.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <h4 className="font-playfair font-semibold text-[#3C1E38] mb-3">Feature Category</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value={category.id}
                          checked={filters.category === category.id}
                          onChange={(e) => handleFilterChange("category", e.target.value)}
                          className="text-[#A7C2D7]"
                        />
                        <category.icon className="w-4 h-4 text-[#A7C2D7]" />
                        <span className="font-inter text-[#3C1E38]">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Spiritual Focus */}
                <div>
                  <h4 className="font-playfair font-semibold text-[#3C1E38] mb-3">Spiritual Focus</h4>
                  <div className="space-y-2">
                    {[
                      { id: "all", name: "All Areas" },
                      { id: "prayer", name: "Prayer Life" },
                      { id: "scripture", name: "Bible Study" },
                      { id: "growth", name: "Personal Growth" },
                      { id: "service", name: "Service & Ministry" },
                    ].map((focus) => (
                      <label key={focus.id} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="spiritualFocus"
                          value={focus.id}
                          checked={filters.spiritualFocus === focus.id}
                          onChange={(e) => handleFilterChange("spiritualFocus", e.target.value)}
                          className="text-[#A7C2D7]"
                        />
                        <span className="font-inter text-[#3C1E38]">{focus.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="mt-6 pt-4 border-t border-[#A7C2D7]/20">
                <Button
                  variant="outline"
                  onClick={() => {
                    const defaultFilters = {
                      complexity: "all",
                      category: "all",
                      spiritualFocus: "all",
                    } as FeatureFilters
                    setFilters(defaultFilters)
                    onFilterChange(defaultFilters)
                    setSearchQuery("")
                    onSearchChange("")
                  }}
                  className="text-[#3C1E38]/60 hover:text-[#3C1E38]"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

    </>
  )
}
