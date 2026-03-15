"use client"

import { useRef, useEffect, useState } from "react"
import { Heart, MessageCircle, Share, Star } from "lucide-react"

const socialTestimonials = [
  {
    id: 1,
    platform: "Instagram",
    username: "@sarahfaith_journey",
    name: "Sarah Michelle",
    avatar: "/placeholder.svg?height=50&width=50",
    content:
      "Day 30 with @altar_app and I'm literally crying tears of joy. My morning routine went from chaotic to sacred. The way it connects my daily tasks with scripture is EVERYTHING. 🙏✨ #AltarApp #SacredMornings",
    image: "/placeholder.svg?height=300&width=300",
    likes: 247,
    comments: 18,
    shares: 12,
    timestamp: "2 hours ago",
    verified: true,
  },
  {
    id: 2,
    platform: "Facebook",
    username: "Rebecca Chen",
    name: "Dr. Rebecca Chen",
    avatar: "/placeholder.svg?height=50&width=50",
    content:
      "As a pediatrician, I thought I had organization down to a science. But ALTAR showed me how to organize my life around God's priorities, not just my own. Every patient interaction now feels like ministry. Highly recommend to any professional woman seeking divine alignment! ⭐⭐⭐⭐⭐",
    likes: 156,
    comments: 23,
    shares: 8,
    timestamp: "5 hours ago",
    verified: false,
  },
  {
    id: 3,
    platform: "Instagram",
    username: "@mompreneur_maria",
    name: "Maria Rodriguez",
    avatar: "/placeholder.svg?height=50&width=50",
    content:
      "Single mom + entrepreneur = constant overwhelm... until ALTAR. The divine guidance feature literally helped me choose which business opportunities aligned with God's will. Revenue up 300% and my daughter says I'm more present than ever. God is SO good! 🚀💕",
    image: "/placeholder.svg?height=300&width=300",
    likes: 389,
    comments: 45,
    shares: 27,
    timestamp: "1 day ago",
    verified: true,
  },
  {
    id: 4,
    platform: "Facebook",
    username: "Grace Thompson",
    name: "Grace Thompson",
    avatar: "/placeholder.svg?height=50&width=50",
    content:
      "Teaching English in Thailand while maintaining my spiritual disciplines seemed impossible. ALTAR's cross-cultural scripture integration has been a lifesaver. The app adapts to different time zones and cultural contexts while keeping me grounded in God's Word. Perfect for missionaries and global workers!",
    likes: 92,
    comments: 14,
    shares: 6,
    timestamp: "2 days ago",
    verified: false,
  },
]

export default function SocialTestimonials() {
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

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-white/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-[#3C1E38] mb-4">
            Social Sacred Stories
          </h2>
          <p className="font-inter text-lg md:text-xl text-[#3C1E38]/70 max-w-2xl mx-auto">
            Real posts from real women sharing their ALTAR transformation on social media
          </p>
        </div>

        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto transform transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
        >
          {socialTestimonials.map((post, index) => (
            <div
              key={post.id}
              className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden transform ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Post Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="relative">
                    <img
                      src={post.avatar || "/placeholder.svg"}
                      alt={post.name}
                      className="w-12 h-12 rounded-full object-cover"
                      crossOrigin="anonymous"
                    />
                    {post.verified && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-inter font-semibold text-[#3C1E38]">{post.name}</h3>
                    <p className="font-inter text-sm text-[#3C1E38]/60">{post.username}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        post.platform === "Instagram"
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {post.platform}
                    </span>
                  </div>
                </div>

                {/* Post Content */}
                <p className="font-inter text-[#3C1E38] leading-relaxed mb-4">{post.content}</p>

                {/* Post Image */}
                {post.image && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt="Post content"
                      className="w-full h-48 object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                )}

                {/* Engagement Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-[#A7C2D7]/20">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-[#3C1E38]/60">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{post.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-[#3C1E38]/60">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{post.comments}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-[#3C1E38]/60">
                      <Share className="w-4 h-4" />
                      <span className="text-sm">{post.shares}</span>
                    </div>
                  </div>
                  <span className="text-sm text-[#3C1E38]/50">{post.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social Proof Stats */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 bg-white rounded-full px-6 py-3 shadow-lg">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-[#F9D57E] fill-current" />
              ))}
            </div>
            <span className="font-inter text-sm text-[#3C1E38]/70">4.9/5 stars across 2,000+ social media reviews</span>
          </div>
        </div>
      </div>
    </section>
  )
}
