"use client"

import { useState } from "react"
import { Users, Briefcase, Heart, BookOpen, Sparkles } from "lucide-react"

const categories = [
  {
    id: "all",
    name: "All Stories",
    icon: Sparkles,
    count: 247,
  },
  {
    id: "mothers",
    name: "Mothers",
    icon: Heart,
    count: 89,
  },
  {
    id: "professionals",
    name: "Professionals",
    icon: Briefcase,
    count: 76,
  },
  {
    id: "ministry",
    name: "Ministry Leaders",
    icon: BookOpen,
    count: 54,
  },
  {
    id: "entrepreneurs",
    name: "Entrepreneurs",
    icon: Users,
    count: 28,
  },
]

const testimonialsByCategory = {
  all: [
    {
      name: "Sarah Chen",
      title: "Mother & Ministry Leader",
      quote: "ALTAR transformed my chaotic mornings into sacred encounters with God.",
      image: "/placeholder.svg?height=60&width=60",
      category: "mothers",
    },
    {
      name: "Dr. Rebecca Martinez",
      title: "Pediatrician",
      quote: "Every patient interaction became an opportunity for ministry.",
      image: "/placeholder.svg?height=60&width=60",
      category: "professionals",
    },
    {
      name: "Grace Thompson",
      title: "Worship Pastor",
      quote: "My personal worship time now flows seamlessly into leading others.",
      image: "/placeholder.svg?height=60&width=60",
      category: "ministry",
    },
    {
      name: "Amanda Foster",
      title: "Tech Entrepreneur",
      quote: "Building my startup with divine guidance has been life-changing.",
      image: "/placeholder.svg?height=60&width=60",
      category: "entrepreneurs",
    },
    {
      name: "Jennifer Walsh",
      title: "Homeschool Mom",
      quote: "Teaching my children became a sacred calling, not just a responsibility.",
      image: "/placeholder.svg?height=60&width=60",
      category: "mothers",
    },
    {
      name: "Dr. Priya Patel",
      title: "Surgeon",
      quote: "I now pray before every surgery and see God's hand in healing.",
      image: "/placeholder.svg?height=60&width=60",
      category: "professionals",
    },
  ],
  mothers: [
    {
      name: "Sarah Chen",
      title: "Mother & Ministry Leader",
      quote: "ALTAR transformed my chaotic mornings into sacred encounters with God.",
      image: "/placeholder.svg?height=60&width=60",
      category: "mothers",
    },
    {
      name: "Jennifer Walsh",
      title: "Homeschool Mom",
      quote: "Teaching my children became a sacred calling, not just a responsibility.",
      image: "/placeholder.svg?height=60&width=60",
      category: "mothers",
    },
  ],
  professionals: [
    {
      name: "Dr. Rebecca Martinez",
      title: "Pediatrician",
      quote: "Every patient interaction became an opportunity for ministry.",
      image: "/placeholder.svg?height=60&width=60",
      category: "professionals",
    },
    {
      name: "Dr. Priya Patel",
      title: "Surgeon",
      quote: "I now pray before every surgery and see God's hand in healing.",
      image: "/placeholder.svg?height=60&width=60",
      category: "professionals",
    },
  ],
  ministry: [
    {
      name: "Grace Thompson",
      title: "Worship Pastor",
      quote: "My personal worship time now flows seamlessly into leading others.",
      image: "/placeholder.svg?height=60&width=60",
      category: "ministry",
    },
  ],
  entrepreneurs: [
    {
      name: "Amanda Foster",
      title: "Tech Entrepreneur",
      quote: "Building my startup with divine guidance has been life-changing.",
      image: "/placeholder.svg?height=60&width=60",
      category: "entrepreneurs",
    },
  ],
}

export default function TestimonialCategories() {
  const [activeCategory, setActiveCategory] = useState("all")

  const currentTestimonials =
    testimonialsByCategory[activeCategory as keyof typeof testimonialsByCategory] || testimonialsByCategory.all

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-[#FBF8F3] via-white to-[#FBF8F3]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-[#3C1E38] mb-4">
            Stories by Sacred Calling
          </h2>
          <p className="font-inter text-lg md:text-xl text-[#3C1E38]/70 max-w-2xl mx-auto">
            Find testimonials from women who share your life season and calling
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => {
            const Icon = category.icon
            const isActive = activeCategory === category.id

            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] text-white shadow-lg scale-105"
                    : "bg-white/80 text-[#3C1E38] hover:bg-white hover:shadow-md"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-inter font-medium">{category.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${isActive ? "bg-white/20" : "bg-[#A7C2D7]/20"}`}>
                  {category.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {currentTestimonials.map((testimonial, index) => (
            <div
              key={`${activeCategory}-${index}`}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
            >
              {/* Profile */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden shadow-md">
                  <img
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
                <div>
                  <h3 className="font-playfair text-lg font-semibold text-[#3C1E38]">{testimonial.name}</h3>
                  <p className="font-inter text-sm text-[#3C1E38]/60">{testimonial.title}</p>
                </div>
              </div>

              {/* Quote */}
              <blockquote className="font-garamond text-lg italic text-[#3C1E38] leading-relaxed group-hover:text-[#A7C2D7] transition-colors duration-300">
                "{testimonial.quote}"
              </blockquote>

              {/* Category Badge */}
              <div className="mt-4 pt-4 border-t border-[#A7C2D7]/20">
                <span className="inline-block px-3 py-1 bg-[#A7C2D7]/20 text-[#3C1E38] text-xs rounded-full">
                  {categories.find((cat) => cat.id === testimonial.category)?.name || "General"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="px-8 py-4 bg-white/80 hover:bg-white text-[#3C1E38] font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            Load More Stories
          </button>
        </div>
      </div>
    </section>
  )
}
