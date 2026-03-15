"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, SkipBack, SkipForward } from "lucide-react"

const voiceTestimonials = [
  {
    id: 1,
    name: "Jennifer Walsh",
    title: "Pastor's Wife & Homeschool Mom",
    avatar: "/placeholder.svg?height=60&width=60",
    duration: "2:45",
    audioUrl: "/placeholder.mp3",
    waveform: [20, 35, 45, 30, 55, 40, 65, 35, 50, 25, 40, 60, 35, 45, 30, 55, 40, 25, 50, 35],
    transcript:
      "I never thought an app could transform my relationship with God, but ALTAR has done exactly that. My mornings used to be chaos - kids screaming, breakfast burning, and me trying to squeeze in a quick prayer. Now I wake up 30 minutes earlier, and those moments with God set the tone for my entire day. The way ALTAR connects scripture with my daily tasks has revolutionized how I see God's presence in the mundane.",
  },
  {
    id: 2,
    name: "Dr. Priya Patel",
    title: "Surgeon & Mother of Twins",
    avatar: "/placeholder.svg?height=60&width=60",
    duration: "3:12",
    audioUrl: "/placeholder.mp3",
    waveform: [30, 45, 25, 60, 35, 50, 40, 55, 30, 45, 35, 40, 50, 25, 60, 35, 45, 30, 40, 55],
    transcript:
      "As a surgeon, precision is everything. But I was precise about everything except my spiritual life. ALTAR brought that same intentionality to my faith. Now before every surgery, I have a specific prayer routine guided by the app. My patients often comment on the peace they feel, and I know it's because I'm operating from a place of divine alignment.",
  },
  {
    id: 3,
    name: "Amanda Johnson",
    title: "Corporate Executive & Worship Leader",
    avatar: "/placeholder.svg?height=60&width=60",
    duration: "2:58",
    audioUrl: "/placeholder.mp3",
    waveform: [40, 25, 55, 35, 45, 30, 60, 40, 35, 50, 25, 45, 55, 30, 40, 35, 50, 45, 30, 40],
    transcript:
      "Balancing corporate leadership with worship ministry felt impossible until ALTAR. The app helped me see that my boardroom decisions and my worship leading aren't separate - they're both expressions of my calling. The divine guidance feature has literally changed how I approach business strategy. I'm making decisions that honor God and drive results.",
  },
]

export default function VoiceTestimonials() {
  const [currentPlaying, setCurrentPlaying] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
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

  const togglePlay = (id: number) => {
    if (currentPlaying === id) {
      setCurrentPlaying(null)
    } else {
      setCurrentPlaying(id)
      // Simulate audio progress
      const interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= 100) {
            setCurrentPlaying(null)
            clearInterval(interval)
            return 0
          }
          return prev + 1
        })
      }, 100)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-gradient-to-br from-[#FBF8F3] via-white to-[#FBF8F3]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-[#3C1E38] mb-4">
            Voices of Transformation
          </h2>
          <p className="font-inter text-lg md:text-xl text-[#3C1E38]/70 max-w-2xl mx-auto">
            Listen to authentic audio testimonials from women whose lives have been transformed by ALTAR
          </p>
        </div>

        <div
          className={`space-y-8 max-w-4xl mx-auto transform transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
        >
          {voiceTestimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden transform ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="p-6 md:p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover shadow-md"
                    crossOrigin="anonymous"
                  />
                  <div className="flex-1">
                    <h3 className="font-playfair text-xl font-bold text-[#3C1E38]">{testimonial.name}</h3>
                    <p className="font-inter text-[#3C1E38]/70">{testimonial.title}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-[#3C1E38]/60">
                      <Volume2 className="w-4 h-4" />
                      <span className="text-sm">{testimonial.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Audio Player */}
                <div className="bg-gradient-to-r from-[#A7C2D7]/10 to-[#F9D57E]/10 rounded-xl p-6 mb-6">
                  {/* Waveform Visualization */}
                  <div className="flex items-center justify-center space-x-1 mb-4 h-16">
                    {testimonial.waveform.map((height, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-300 ${
                          currentPlaying === testimonial.id && i <= currentTime / 5
                            ? "bg-gradient-to-t from-[#A7C2D7] to-[#F9D57E]"
                            : "bg-[#A7C2D7]/30"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button className="p-2 rounded-full bg-white/50 hover:bg-white/80 transition-all">
                        <SkipBack className="w-4 h-4 text-[#3C1E38]" />
                      </button>
                      <button
                        onClick={() => togglePlay(testimonial.id)}
                        className="w-12 h-12 rounded-full bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        {currentPlaying === testimonial.id ? (
                          <Pause className="w-6 h-6 text-white" />
                        ) : (
                          <Play className="w-6 h-6 text-white ml-0.5" />
                        )}
                      </button>
                      <button className="p-2 rounded-full bg-white/50 hover:bg-white/80 transition-all">
                        <SkipForward className="w-4 h-4 text-[#3C1E38]" />
                      </button>
                    </div>

                    <div className="text-sm text-[#3C1E38]/60">
                      {currentPlaying === testimonial.id ? formatTime(Math.floor(currentTime / 10)) : "0:00"} /{" "}
                      {testimonial.duration}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] transition-all duration-300"
                        style={{
                          width: currentPlaying === testimonial.id ? `${currentTime}%` : "0%",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Transcript */}
                <div className="bg-[#FBF8F3] rounded-xl p-6">
                  <h4 className="font-inter font-semibold text-[#3C1E38] mb-3 flex items-center space-x-2">
                    <span>Transcript</span>
                    <span className="text-xs bg-[#A7C2D7]/20 px-2 py-1 rounded-full">Auto-generated</span>
                  </h4>
                  <p className="font-garamond text-lg italic text-[#3C1E38]/80 leading-relaxed">
                    "{testimonial.transcript}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="font-inter text-lg text-[#3C1E38]/70 mb-6">Ready to share your own voice testimonial?</p>
          <button className="px-8 py-4 bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] text-white font-semibold rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 mx-auto">
            <Volume2 className="w-5 h-5" />
            <span>Record Your Story</span>
          </button>
        </div>
      </div>
    </section>
  )
}
