"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Star, Clock, Volume2, X, ChevronLeft, ChevronRight } from "lucide-react"

const videoTestimonials = [
  {
    id: 1,
    name: "Jennifer Walsh",
    title: "Pastor's Wife & Homeschool Mom",
    thumbnail: "/placeholder.svg?height=300&width=400",
    duration: "3:42",
    preview: "How ALTAR transformed my chaotic mornings into sacred encounters with God...",
    rating: 5,
    views: "2.1K",
    featured: true,
  },
  {
    id: 2,
    name: "Dr. Priya Patel",
    title: "Surgeon & Mother of Twins",
    thumbnail: "/placeholder.svg?height=300&width=400",
    duration: "2:58",
    preview: "Finding divine guidance in the operating room and at home...",
    rating: 5,
    views: "1.8K",
    featured: false,
  },
  {
    id: 3,
    name: "Amanda Johnson",
    title: "Corporate Executive & Worship Leader",
    thumbnail: "/placeholder.svg?height=300&width=400",
    duration: "4:15",
    preview: "Balancing boardroom decisions with kingdom priorities...",
    rating: 5,
    views: "3.2K",
    featured: false,
  },
  {
    id: 4,
    name: "Grace Thompson",
    title: "Missionary & Language Teacher",
    thumbnail: "/placeholder.svg?height=300&width=400",
    duration: "3:27",
    preview: "Using ALTAR to maintain spiritual disciplines across cultures...",
    rating: 5,
    views: "1.5K",
    featured: false,
  },
  {
    id: 5,
    name: "Michelle Rodriguez",
    title: "Fitness Coach & Ministry Volunteer",
    thumbnail: "/placeholder.svg?height=300&width=400",
    duration: "2:45",
    preview: "Integrating physical and spiritual disciplines for holistic health...",
    rating: 5,
    views: "2.3K",
    featured: false,
  },
  {
    id: 6,
    name: "Sarah Kim",
    title: "College Student & Worship Team Leader",
    thumbnail: "/placeholder.svg?height=300&width=400",
    duration: "3:10",
    preview: "Finding sacred rhythms during the chaos of college life...",
    rating: 5,
    views: "1.9K",
    featured: false,
  },
]

export default function VideoTestimonials() {
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const videosPerPage = 3

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

  const totalPages = Math.ceil((videoTestimonials.length - 1) / videosPerPage)
  const featuredVideo = videoTestimonials.find((v) => v.featured)
  const regularVideos = videoTestimonials.filter((v) => !v.featured)
  const paginatedVideos = regularVideos.slice(currentPage * videosPerPage, (currentPage + 1) * videosPerPage)

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
  }

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-white/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-[#3C1E38] mb-4">
            Sacred Stories in Motion
          </h2>
          <p className="font-inter text-lg md:text-xl text-[#3C1E38]/70 max-w-2xl mx-auto">
            Watch real women share their transformation journeys in their own words
          </p>
        </div>

        {/* Featured Video */}
        {featuredVideo && (
          <div
            className={`mb-16 transform transition-all duration-1000 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            }`}
          >
            <div className="group cursor-pointer relative overflow-hidden rounded-2xl shadow-2xl">
              <div className="aspect-video relative">
                <img
                  src={featuredVideo.thumbnail || "/placeholder.svg"}
                  alt={`${featuredVideo.name} testimonial`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  crossOrigin="anonymous"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-90"></div>

                {/* Play Button */}
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  onClick={() => setSelectedVideo(featuredVideo.id)}
                >
                  <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-500 group-hover:scale-110">
                    <Play className="w-10 h-10 text-[#A7C2D7] ml-1" />
                  </div>
                </div>

                {/* Video Info */}
                <div className="absolute bottom-0 left-0 p-8 text-white">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-[#F9D57E] text-[#3C1E38] px-3 py-1 rounded-full text-sm font-medium">
                      Featured Story
                    </span>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-[#F9D57E] fill-current" />
                      ))}
                    </div>
                  </div>
                  <h3 className="font-playfair text-2xl md:text-3xl font-bold mb-2">{featuredVideo.name}</h3>
                  <p className="font-inter text-white/80 mb-3">{featuredVideo.title}</p>
                  <p className="font-garamond text-lg italic text-white/90">"{featuredVideo.preview}"</p>

                  {/* Duration & Views */}
                  <div className="flex items-center space-x-4 mt-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-white/70" />
                      <span className="text-white/70 text-sm">{featuredVideo.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Play className="w-4 h-4 text-white/70" />
                      <span className="text-white/70 text-sm">{featuredVideo.views} views</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {paginatedVideos.map((video, index) => (
            <div
              key={video.id}
              className={`group cursor-pointer transform transition-all duration-500 hover:scale-105 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
              onClick={() => setSelectedVideo(video.id)}
            >
              <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Video Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={`${video.name} testimonial`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    crossOrigin="anonymous"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80"></div>

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-8 h-8 text-[#A7C2D7] ml-1" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{video.duration}</span>
                  </div>

                  {/* Views Badge */}
                  <div className="absolute bottom-4 left-4 bg-white/90 text-[#3C1E38] px-2 py-1 rounded text-sm">
                    {video.views} views
                  </div>

                  {/* Title Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-playfair text-xl font-bold mb-1">{video.name}</h3>
                    <p className="font-inter text-white/80 text-sm">{video.title}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-4">
            <button
              onClick={prevPage}
              className="p-2 rounded-full bg-white shadow hover:shadow-md transition-all"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-6 h-6 text-[#3C1E38]" />
            </button>
            <div className="flex items-center space-x-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === currentPage ? "bg-[#A7C2D7] scale-125" : "bg-[#A7C2D7]/30"
                  }`}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={nextPage}
              className="p-2 rounded-full bg-white shadow hover:shadow-md transition-all"
              aria-label="Next page"
            >
              <ChevronRight className="w-6 h-6 text-[#3C1E38]" />
            </button>
          </div>
        )}

        {/* Video Modal */}
        {selectedVideo && (
          <div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <div className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <div className="relative aspect-video bg-black">
                {/* Video Player Placeholder */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Play className="w-16 h-16 text-white/50 mb-4" />
                  <p className="text-white/70 text-center max-w-md">
                    Video player would be embedded here. This is a placeholder for the actual video content.
                  </p>
                </div>

                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button className="text-white">
                      <Play className="w-6 h-6" />
                    </button>
                    <div className="w-32 h-1 bg-white/30 rounded-full">
                      <div className="w-1/3 h-full bg-white rounded-full"></div>
                    </div>
                    <span className="text-white/70 text-sm">1:15 / 3:42</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button className="text-white">
                      <Volume2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  className="absolute top-4 right-4 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
                  onClick={() => setSelectedVideo(null)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <h3 className="font-playfair text-2xl font-bold text-[#3C1E38] mb-2">
                  {videoTestimonials.find((v) => v.id === selectedVideo)?.name}
                </h3>
                <p className="font-inter text-[#3C1E38]/70 mb-4">
                  {videoTestimonials.find((v) => v.id === selectedVideo)?.title}
                </p>
                <p className="font-inter text-[#3C1E38]/80">
                  "{videoTestimonials.find((v) => v.id === selectedVideo)?.preview}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="font-inter text-lg text-[#3C1E38]/70 mb-6">Ready to write your own sacred story?</p>
          <button className="px-8 py-4 bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] text-white font-semibold rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300">
            Start Your Transformation
          </button>
        </div>
      </div>
    </section>
  )
}
