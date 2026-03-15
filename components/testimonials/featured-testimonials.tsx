"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, Quote, Star, Calendar, Heart, CheckCircle } from "lucide-react"

const featuredTestimonials = [
  {
    id: 1,
    name: "Sarah Michelle",
    title: "Mother of 3, Ministry Leader",
    location: "Austin, TX",
    image: "/placeholder.svg?key=4afbo",
    rating: 5,
    joinDate: "March 2023",
    story:
      "I was drowning in the chaos of motherhood and ministry responsibilities. My morning 'quiet time' had become a rushed 5-minute prayer while making breakfast. ALTAR changed everything. Now I wake up 30 minutes earlier, and those moments feel like stepping into the throne room of God. My children notice the difference—I'm more patient, more present, more peaceful. The way ALTAR connects my daily tasks with divine purpose has transformed not just my schedule, but my entire relationship with God.",
    highlight: "Transformed my relationship with God",
    beforeAfter: {
      before: "Rushed 5-minute prayers while multitasking",
      after: "30 minutes of sacred morning time in God's presence",
      beforeImage: "/placeholder.svg?key=07rj6",
      afterImage: "/placeholder.svg?key=5fjf2",
    },
    tags: ["Motherhood", "Ministry", "Morning Routine"],
    verified: true,
    scripture: "Isaiah 40:31",
  },
  {
    id: 2,
    name: "Dr. Rebecca Chen",
    title: "Pediatrician & Bible Study Leader",
    location: "San Francisco, CA",
    image: "/placeholder.svg?key=npxeg",
    rating: 5,
    joinDate: "January 2023",
    story:
      "As a doctor, I thought I had organization figured out. But my spiritual life was compartmentalized—separate from my 'real' work. ALTAR helped me see that healing children IS ministry, that every patient interaction can be a prayer. The app's integration of scripture with daily planning has revolutionized how I approach both medicine and faith. I now start each day with divine guidance, and my patients often comment on the peace they feel in my presence.",
    highlight: "Integrated faith with professional calling",
    beforeAfter: {
      before: "Compartmentalized spiritual and professional life",
      after: "Every patient interaction becomes an opportunity for ministry",
      beforeImage: "/placeholder.svg?key=3mvpp",
      afterImage: "/placeholder.svg?height=300&width=400",
    },
    tags: ["Healthcare", "Professional", "Integration"],
    verified: true,
    scripture: "Colossians 3:23",
  },
  {
    id: 3,
    name: "Maria Rodriguez",
    title: "Entrepreneur & Single Mom",
    location: "Miami, FL",
    image: "/placeholder.svg?height=120&width=120",
    rating: 5,
    joinDate: "June 2023",
    story:
      "Building a business while raising my daughter alone felt impossible. I was constantly torn between providing for her and being present with her. ALTAR's divine guidance feature helped me realize that God had a plan for both my business and my parenting. The app helped me identify which opportunities aligned with His will and which were just distractions. My business has grown 300% this year, but more importantly, my daughter and I have never been closer to each other or to God.",
    highlight: "300% business growth while deepening family bonds",
    beforeAfter: {
      before: "Torn between business success and family time",
      after: "Aligned business decisions with divine will, achieving both",
      beforeImage: "/placeholder.svg?height=300&width=400",
      afterImage: "/placeholder.svg?height=300&width=400",
    },
    tags: ["Entrepreneurship", "Single Parenting", "Growth"],
    verified: true,
    scripture: "Philippians 4:13",
  },
]

export default function FeaturedTestimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.3 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % featuredTestimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + featuredTestimonials.length) % featuredTestimonials.length)
  }

  const current = featuredTestimonials[currentTestimonial]

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-gradient-to-br from-[#FBF8F3] via-white to-[#FBF8F3]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-[#3C1E38] mb-4">
            Sacred Stories of Transformation
          </h2>
          <p className="font-inter text-lg md:text-xl text-[#3C1E38]/70 max-w-2xl mx-auto">
            Deep dives into how ALTAR has transformed the spiritual journeys of remarkable women
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div
            className={`transform transition-all duration-1000 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            }`}
          >
            {/* Main Testimonial Card */}
            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#A7C2D7]/5 via-transparent to-[#F9D57E]/5"></div>

              <div className="relative p-8 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                  {/* Left Column - Profile */}
                  <div className="lg:col-span-1">
                    <div className="text-center lg:text-left">
                      {/* Profile Image */}
                      <div className="relative inline-block mb-6">
                        <div className="w-32 h-32 rounded-full overflow-hidden shadow-xl ring-4 ring-white/50">
                          <img
                            src={current.image || "/placeholder.svg"}
                            alt={current.name}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E] rounded-full flex items-center justify-center shadow-lg">
                          <Quote className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      {/* Profile Info with Verification Badge */}
                      <div className="mb-2">
                        <div className="flex items-center justify-center lg:justify-start space-x-2">
                          <h3 className="font-playfair text-2xl font-bold text-[#3C1E38]">{current.name}</h3>
                          {current.verified && (
                            <div className="flex items-center space-x-1 bg-[#A7C2D7]/20 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3 text-[#A7C2D7]" />
                              <span className="text-xs text-[#3C1E38]/70">Verified</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="font-inter text-[#3C1E38]/70 mb-2">{current.title}</p>
                      <p className="font-inter text-sm text-[#3C1E38]/50 mb-4">{current.location}</p>

                      {/* Rating */}
                      <div className="flex justify-center lg:justify-start space-x-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-[#F9D57E] fill-current" />
                        ))}
                      </div>

                      {/* Join Date */}
                      <div className="flex items-center justify-center lg:justify-start space-x-2 text-sm text-[#3C1E38]/60 mb-6">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {current.joinDate}</span>
                      </div>

                      {/* Scripture Reference */}
                      <div className="mb-6 p-3 bg-[#F9D57E]/10 rounded-lg">
                        <p className="font-garamond text-sm italic text-[#3C1E38]/80">
                          Favorite Scripture: {current.scripture}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                        {current.tags.map((tag, index) => (
                          <span key={index} className="px-3 py-1 bg-[#A7C2D7]/20 text-[#3C1E38] text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Story */}
                  <div className="lg:col-span-2">
                    {/* Highlight */}
                    <div className="bg-gradient-to-r from-[#A7C2D7]/20 to-[#F9D57E]/20 rounded-2xl p-6 mb-8">
                      <div className="flex items-center space-x-3 mb-3">
                        <Heart className="w-6 h-6 text-[#A7C2D7]" />
                        <span className="font-inter font-semibold text-[#3C1E38]">Key Transformation</span>
                      </div>
                      <p className="font-playfair text-xl italic text-[#3C1E38]">"{current.highlight}"</p>
                    </div>

                    {/* Story */}
                    <blockquote className="font-garamond text-lg md:text-xl leading-relaxed text-[#3C1E38] mb-8">
                      "{current.story}"
                    </blockquote>

                    {/* Before/After with Images */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="relative">
                        <img
                          src={current.beforeAfter.beforeImage || "/placeholder.svg"}
                          alt={`Before ALTAR: ${current.beforeAfter.before}`}
                          className="w-full h-48 object-cover rounded-t-lg"
                          crossOrigin="anonymous"
                        />
                        <div className="absolute top-4 left-4 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                          Before ALTAR
                        </div>
                        <div className="bg-red-50 rounded-b-lg p-4">
                          <h4 className="font-inter font-semibold text-red-800 mb-2">The Challenge</h4>
                          <p className="text-red-700 text-sm">{current.beforeAfter.before}</p>
                        </div>
                      </div>
                      <div className="relative">
                        <img
                          src={current.beforeAfter.afterImage || "/placeholder.svg"}
                          alt={`After ALTAR: ${current.beforeAfter.after}`}
                          className="w-full h-48 object-cover rounded-t-lg"
                          crossOrigin="anonymous"
                        />
                        <div className="absolute top-4 left-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          After ALTAR
                        </div>
                        <div className="bg-green-50 rounded-b-lg p-4">
                          <h4 className="font-inter font-semibold text-green-800 mb-2">The Transformation</h4>
                          <p className="text-green-700 text-sm">{current.beforeAfter.after}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={prevTestimonial}
                className="flex items-center space-x-2 px-6 py-3 bg-white/80 hover:bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <ChevronLeft className="w-5 h-5 text-[#3C1E38] group-hover:text-[#A7C2D7] transition-colors" />
                <span className="font-inter text-[#3C1E38] group-hover:text-[#A7C2D7] transition-colors">Previous</span>
              </button>

              {/* Dots */}
              <div className="flex space-x-3">
                {featuredTestimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonial ? "bg-[#A7C2D7] scale-125" : "bg-[#A7C2D7]/30 hover:bg-[#A7C2D7]/50"
                    }`}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="flex items-center space-x-2 px-6 py-3 bg-white/80 hover:bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <span className="font-inter text-[#3C1E38] group-hover:text-[#A7C2D7] transition-colors">Next</span>
                <ChevronRight className="w-5 h-5 text-[#3C1E38] group-hover:text-[#A7C2D7] transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
