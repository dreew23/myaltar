"use client"

import { useState } from "react"
import { BookOpen, Heart, Calendar, Users, Sparkles, ChevronRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { trackButtonClick } from "@/lib/safe-analytics"

const featureCategories = [
  {
    id: "planning",
    name: "Sacred Planning",
    icon: Calendar,
    description: "Divine-guided task management and spiritual scheduling",
    color: "from-[#A7C2D7] to-[#A7C2D7]/70",
    features: [
      {
        title: "Prayer-Guided Planning",
        description: "Begin each planning session with guided prayer and divine discernment",
        benefits: ["Align tasks with God's will", "Reduce anxiety about decisions", "Find peace in daily planning"],
        demo: "Watch how prayer transforms your planning process",
      },
      {
        title: "Sacred Time Blocking",
        description: "Schedule activities around prayer, devotion, and spiritual practices",
        benefits: ["Protect sacred time", "Balance spiritual and practical", "Honor divine rhythms"],
        demo: "See how to create sacred boundaries in your calendar",
      },
      {
        title: "Kingdom Priority Framework",
        description: "Organize tasks based on eternal significance and spiritual calling",
        benefits: ["Focus on what matters most", "Align with biblical values", "Live with purpose"],
        demo: "Learn the Kingdom Priority system",
      },
    ],
  },
  {
    id: "spiritual",
    name: "Spiritual Growth",
    icon: Heart,
    description: "Track your faith journey and spiritual development",
    color: "from-[#F9D57E] to-[#F9D57E]/70",
    features: [
      {
        title: "Scripture Integration",
        description: "Weave biblical wisdom throughout your planning and daily tasks",
        benefits: ["Daily scripture guidance", "Contextual biblical insights", "Memorization support"],
        demo: "Experience scripture-powered planning",
      },
      {
        title: "Prayer Request Tracking",
        description: "Record, organize, and celebrate answered prayers over time",
        benefits: ["Build faith through testimony", "Organize prayer life", "See God's faithfulness"],
        demo: "Track your prayer journey",
      },
      {
        title: "Spiritual Disciplines",
        description: "Track and develop consistent spiritual practices and habits",
        benefits: ["Build spiritual momentum", "Track growth patterns", "Gentle accountability"],
        demo: "Develop lasting spiritual habits",
      },
    ],
  },
  {
    id: "community",
    name: "Sacred Community",
    icon: Users,
    description: "Connect with other women on similar spiritual journeys",
    color: "from-[#A7C2D7]/70 to-[#F9D57E]/70",
    features: [
      {
        title: "Prayer Circles",
        description: "Join small groups for mutual prayer support and encouragement",
        benefits: ["Shared prayer burdens", "Spiritual sisterhood", "Accountability partners"],
        demo: "Join a prayer circle",
      },
      {
        title: "Wisdom Sharing",
        description: "Share insights and learn from other women's spiritual experiences",
        benefits: ["Learn from others", "Share your testimony", "Grow together"],
        demo: "Share and receive wisdom",
      },
      {
        title: "Mentorship Connections",
        description: "Connect with spiritual mentors or become one for others",
        benefits: ["Spiritual guidance", "Intergenerational wisdom", "Leadership development"],
        demo: "Find your spiritual mentor",
      },
    ],
  },
  {
    id: "devotional",
    name: "Morning Devotions",
    icon: BookOpen,
    description: "Start each day with divine connection and purpose",
    color: "from-[#A7C2D7]/70 to-[#A7C2D7]/40",
    features: [
      {
        title: "Personalized Scripture",
        description: "Receive daily scripture aligned with your spiritual season",
        benefits: ["Relevant biblical guidance", "Seasonal spiritual focus", "Progressive revelation"],
        demo: "See how scripture selection works",
      },
      {
        title: "Guided Prayer Templates",
        description: "Structured prayer prompts for different needs and situations",
        benefits: ["Deepen prayer life", "Learn new prayer approaches", "Overcome prayer blocks"],
        demo: "Explore prayer templates",
      },
      {
        title: "Reflection Journaling",
        description: "Capture divine insights and spiritual growth moments",
        benefits: ["Process spiritual insights", "Build spiritual memory", "Track divine guidance"],
        demo: "Experience guided journaling",
      },
    ],
  },
]

interface FeaturesCategoriesProps {
  filters: {
    complexity: "all" | "beginner" | "intermediate" | "advanced"
    category: "all" | "planning" | "spiritual" | "community" | "devotional"
    spiritualFocus: "all" | "prayer" | "scripture" | "growth" | "service"
  }
  searchQuery: string
  personalizedFeatures: string[]
}

export default function FeaturesCategories({ filters, searchQuery, personalizedFeatures }: FeaturesCategoriesProps) {
  const [activeCategory, setActiveCategory] = useState("planning")
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null)

  const currentCategory = featureCategories.find((cat) => cat.id === activeCategory)

  const handleDemoClick = (demoTitle: string) => {
    trackButtonClick(demoTitle, "features_categories")
  }

  return (
    <section id="features-categories" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-[#A7C2D7] mr-3" />
              <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-[#3C1E38]">
                Features by Category
              </h2>
              <Sparkles className="w-6 h-6 text-[#A7C2D7] ml-3" />
            </div>
            <p className="font-inter text-lg md:text-xl text-[#3C1E38]/70 max-w-3xl mx-auto">
              Explore our comprehensive suite of features designed to transform your spiritual practice and daily
              planning
            </p>
          </div>

          {/* Personalized Recommendations */}
          {personalizedFeatures.length > 0 && (
            <div className="mb-12 p-6 bg-gradient-to-r from-[#A7C2D7]/10 to-[#F9D57E]/10 rounded-2xl border border-[#A7C2D7]/20">
              <div className="text-center mb-6">
                <h3 className="font-playfair text-2xl font-bold text-[#3C1E38] mb-2">
                  ✨ Your Personalized Sacred Journey
                </h3>
                <p className="font-inter text-[#3C1E38]/70">
                  Based on your spiritual assessment, these features are specially recommended for you
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personalizedFeatures.slice(0, 6).map((feature, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-[#A7C2D7]/20 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E] flex items-center justify-center">
                        <span className="text-white text-sm">✨</span>
                      </div>
                      <span className="font-inter font-medium text-[#3C1E38] capitalize">
                        {feature.replace("-", " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feature Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Category Navigation */}
            <div className="lg:col-span-1">
              <div className="space-y-2">
                {featureCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                      activeCategory === category.id
                        ? `bg-gradient-to-r ${category.color} border-l-4 border-[#A7C2D7] text-white`
                        : "hover:bg-[#FBF8F3] border-l-4 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <category.icon
                        className={`w-5 h-5 ${activeCategory === category.id ? "text-white" : "text-[#3C1E38]/60"}`}
                      />
                      <span
                        className={`font-playfair font-semibold ${
                          activeCategory === category.id ? "text-white" : "text-[#3C1E38]/80"
                        }`}
                      >
                        {category.name}
                      </span>
                    </div>
                    <p
                      className={`font-inter text-sm ${
                        activeCategory === category.id ? "text-white/90" : "text-[#3C1E38]/60"
                      }`}
                    >
                      {category.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Feature Details */}
            <div className="lg:col-span-3">
              {currentCategory && (
                <div className="space-y-6">
                  {currentCategory.features.map((feature, index) => (
                    <div
                      key={index}
                      className="bg-[#FBF8F3] rounded-xl p-6 border border-[#A7C2D7]/20 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-playfair text-xl font-semibold text-[#3C1E38] mb-2">{feature.title}</h3>
                          <p className="font-inter text-[#3C1E38]/70 mb-4">{feature.description}</p>

                          {/* Demo Button */}
                          <div className="flex items-center gap-4 mb-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDemoClick(feature.demo)}
                              className="border-[#A7C2D7] text-[#A7C2D7] hover:bg-[#A7C2D7] hover:text-white"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              {feature.demo}
                            </Button>
                          </div>

                          <button
                            onClick={() => setExpandedFeature(expandedFeature === feature.title ? null : feature.title)}
                            className="flex items-center gap-2 text-[#A7C2D7] hover:text-[#A7C2D7]/80 transition-colors"
                          >
                            <span className="font-inter text-sm font-medium">View Benefits</span>
                            <ChevronRight
                              className={`w-4 h-4 transition-transform duration-200 ${
                                expandedFeature === feature.title ? "rotate-90" : ""
                              }`}
                            />
                          </button>

                          {/* Expanded Benefits */}
                          {expandedFeature === feature.title && (
                            <div className="mt-4 pt-4 border-t border-[#A7C2D7]/20">
                              <h4 className="font-inter text-sm font-medium text-[#3C1E38] mb-3">Key Benefits:</h4>
                              <ul className="space-y-2">
                                {feature.benefits.map((benefit, benefitIndex) => (
                                  <li key={benefitIndex} className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#A7C2D7] mt-2 flex-shrink-0"></div>
                                    <span className="font-inter text-sm text-[#3C1E38]/70">{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
