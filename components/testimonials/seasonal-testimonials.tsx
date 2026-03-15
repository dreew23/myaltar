"use client"

import { useRef, useEffect, useState } from "react"
import { Calendar, Flower, Sun, Cross, Star } from "lucide-react"

const seasonalTestimonials = {
  advent: {
    title: "Advent Testimonials",
    subtitle: "Preparing Hearts for Christ's Coming",
    icon: Star,
    color: "from-purple-600 to-blue-600",
    bgColor: "from-purple-100 to-blue-50",
    testimonials: [
      {
        name: "Mary Catherine",
        title: "Mother & Bible Study Leader",
        quote:
          "ALTAR's Advent devotionals transformed our family's Christmas preparation. Instead of rushing through December, we savored each moment of anticipation.",
        image: "/placeholder.svg?height=80&width=80",
      },
      {
        name: "Elizabeth Grace",
        title: "Seminary Student",
        quote:
          "The daily Advent reflections in ALTAR helped me understand the profound mystery of the Incarnation in a completely new way.",
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
  },
  lent: {
    title: "Lenten Transformation Stories",
    subtitle: "Journey to the Cross",
    icon: Cross,
    color: "from-purple-700 to-purple-900",
    bgColor: "from-purple-50 to-purple-100",
    testimonials: [
      {
        name: "Rachel Thompson",
        title: "Worship Pastor",
        quote:
          "ALTAR's Lenten disciplines guide helped me fast from distractions and feast on God's presence. This was my most meaningful Lent ever.",
        image: "/placeholder.svg?height=80&width=80",
      },
      {
        name: "Hannah Rodriguez",
        title: "College Campus Minister",
        quote:
          "The 40-day Lenten journey in ALTAR taught me that sacrifice isn't about giving up—it's about making room for more of God.",
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
  },
  easter: {
    title: "Easter Joy Testimonials",
    subtitle: "Celebrating the Resurrection",
    icon: Flower,
    color: "from-yellow-400 to-orange-500",
    bgColor: "from-yellow-50 to-orange-50",
    testimonials: [
      {
        name: "Joy Martinez",
        title: "Children's Ministry Director",
        quote:
          "ALTAR's Easter celebration features helped our family experience the resurrection joy in fresh, meaningful ways throughout the season.",
        image: "/placeholder.svg?height=80&width=80",
      },
      {
        name: "Hope Johnson",
        title: "Missionary",
        quote:
          "The resurrection-focused devotionals in ALTAR reminded me daily that the same power that raised Jesus lives in me. Life-changing!",
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
  },
  ordinary: {
    title: "Ordinary Time Testimonials",
    subtitle: "Finding Sacred in the Everyday",
    icon: Sun,
    color: "from-green-500 to-green-700",
    bgColor: "from-green-50 to-green-100",
    testimonials: [
      {
        name: "Grace Williams",
        title: "Homeschool Mom",
        quote:
          "ALTAR showed me that 'ordinary time' isn't ordinary at all. Every mundane moment became an opportunity for divine encounter.",
        image: "/placeholder.svg?height=80&width=80",
      },
      {
        name: "Faith Anderson",
        title: "Nurse & Small Group Leader",
        quote:
          "The everyday spiritual practices in ALTAR transformed my perspective on routine. Now every shift at the hospital feels like ministry.",
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
  },
}

export default function SeasonalTestimonials() {
  const [activeSeason, setActiveSeason] = useState<keyof typeof seasonalTestimonials>("advent")
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

  // Auto-rotate through seasons
  useEffect(() => {
    const seasons = Object.keys(seasonalTestimonials) as Array<keyof typeof seasonalTestimonials>
    let currentIndex = 0

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % seasons.length
      setActiveSeason(seasons[currentIndex])
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const currentSeason = seasonalTestimonials[activeSeason]
  const IconComponent = currentSeason.icon

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-white/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-[#3C1E38] mb-4">
            Sacred Seasons, Sacred Stories
          </h2>
          <p className="font-inter text-lg md:text-xl text-[#3C1E38]/70 max-w-2xl mx-auto">
            How ALTAR guides women through the liturgical calendar and spiritual seasons
          </p>
        </div>

        {/* Season Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {Object.entries(seasonalTestimonials).map(([season, data]) => {
            const IconComp = data.icon
            return (
              <button
                key={season}
                onClick={() => setActiveSeason(season as keyof typeof seasonalTestimonials)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-300 ${
                  activeSeason === season
                    ? `bg-gradient-to-r ${data.color} text-white shadow-lg scale-105`
                    : "bg-white text-[#3C1E38] hover:shadow-md"
                }`}
              >
                <IconComp className="w-5 h-5" />
                <span className="font-inter font-medium capitalize">{season}</span>
              </button>
            )
          })}
        </div>

        {/* Active Season Content */}
        <div
          className={`transform transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
        >
          <div className={`bg-gradient-to-br ${currentSeason.bgColor} rounded-3xl overflow-hidden shadow-2xl`}>
            <div className="p-8 md:p-12">
              {/* Season Header */}
              <div className="text-center mb-12">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${currentSeason.color} mb-6`}
                >
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-playfair text-3xl md:text-4xl font-bold text-[#3C1E38] mb-2">
                  {currentSeason.title}
                </h3>
                <p className="font-inter text-lg text-[#3C1E38]/70">{currentSeason.subtitle}</p>
              </div>

              {/* Testimonials Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {currentSeason.testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover shadow-md"
                        crossOrigin="anonymous"
                      />
                      <div>
                        <h4 className="font-playfair text-lg font-bold text-[#3C1E38]">{testimonial.name}</h4>
                        <p className="font-inter text-sm text-[#3C1E38]/70">{testimonial.title}</p>
                      </div>
                    </div>
                    <blockquote className="font-garamond text-lg italic text-[#3C1E38] leading-relaxed">
                      "{testimonial.quote}"
                    </blockquote>
                  </div>
                ))}
              </div>

              {/* Season-Specific Features */}
              <div className="mt-12 text-center">
                <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3">
                  <Calendar className="w-5 h-5 text-[#3C1E38]" />
                  <span className="font-inter text-[#3C1E38]">
                    {activeSeason === "advent" && "25 Days of Advent Devotionals"}
                    {activeSeason === "lent" && "40 Days of Lenten Disciplines"}
                    {activeSeason === "easter" && "50 Days of Resurrection Joy"}
                    {activeSeason === "ordinary" && "Year-Round Sacred Rhythms"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center space-x-3 mt-8">
          {Object.keys(seasonalTestimonials).map((season, index) => (
            <button
              key={season}
              onClick={() => setActiveSeason(season as keyof typeof seasonalTestimonials)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeSeason === season ? "bg-[#A7C2D7] scale-125" : "bg-[#A7C2D7]/30 hover:bg-[#A7C2D7]/50"
              }`}
              aria-label={`View ${season} testimonials`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
