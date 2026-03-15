"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Star, Send, CheckCircle, Camera, Video } from "lucide-react"

export default function TestimonialSubmission() {
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    location: "",
    email: "",
    testimonial: "",
    rating: 5,
    category: "",
    scripture: "",
    photo: null as File | null,
    video: null as File | null,
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitted(true)
    }, 1000)
  }

  const handleFileUpload = (type: "photo" | "video") => {
    if (type === "photo" && fileInputRef.current) {
      fileInputRef.current.click()
    } else if (type === "video" && videoInputRef.current) {
      videoInputRef.current.click()
    }
  }

  if (isSubmitted) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-br from-[#A7C2D7]/10 to-[#F9D57E]/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#3C1E38] mb-4">
              Thank You for Sharing Your Sacred Story
            </h2>
            <p className="font-inter text-lg text-[#3C1E38]/70 mb-8">
              Your testimonial has been received and will be reviewed by our team. We're honored to share in your
              transformation journey.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="px-6 py-3 bg-white text-[#3C1E38] rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Submit Another Story
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-gradient-to-br from-[#A7C2D7]/10 to-[#F9D57E]/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-[#3C1E38] mb-4">
            Share Your Sacred Story
          </h2>
          <p className="font-inter text-lg md:text-xl text-[#3C1E38]/70 max-w-2xl mx-auto">
            Your transformation could inspire another woman to begin her own sacred journey
          </p>
        </div>

        <div
          className={`max-w-3xl mx-auto transform transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
        >
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-inter font-medium text-[#3C1E38] mb-2">Your Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-[#A7C2D7]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A7C2D7] transition-all"
                      placeholder="Sarah Johnson"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-inter font-medium text-[#3C1E38] mb-2">Your Title/Role</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-[#A7C2D7]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A7C2D7] transition-all"
                      placeholder="Mother of 3, Ministry Leader"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-inter font-medium text-[#3C1E38] mb-2">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 border border-[#A7C2D7]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A7C2D7] transition-all"
                      placeholder="Austin, TX"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-inter font-medium text-[#3C1E38] mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-[#A7C2D7]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A7C2D7] transition-all"
                      placeholder="sarah@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Category and Scripture */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-inter font-medium text-[#3C1E38] mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border border-[#A7C2D7]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A7C2D7] transition-all"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="motherhood">Motherhood</option>
                      <option value="professional">Professional Life</option>
                      <option value="ministry">Ministry</option>
                      <option value="entrepreneurship">Entrepreneurship</option>
                      <option value="student">Student Life</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-inter font-medium text-[#3C1E38] mb-2">
                      Favorite Scripture (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.scripture}
                      onChange={(e) => setFormData({ ...formData, scripture: e.target.value })}
                      className="w-full px-4 py-3 border border-[#A7C2D7]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A7C2D7] transition-all"
                      placeholder="Philippians 4:13"
                    />
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block font-inter font-medium text-[#3C1E38] mb-2">Your ALTAR Rating</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="transition-all duration-200"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= formData.rating ? "text-[#F9D57E] fill-current" : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Testimonial */}
                <div>
                  <label className="block font-inter font-medium text-[#3C1E38] mb-2">Your Sacred Story</label>
                  <textarea
                    value={formData.testimonial}
                    onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-[#A7C2D7]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A7C2D7] transition-all resize-none"
                    placeholder="Share how ALTAR has transformed your spiritual journey. What was your life like before? How has it changed? What specific features or moments made the biggest difference?"
                    required
                  />
                  <p className="text-sm text-[#3C1E38]/60 mt-2">{formData.testimonial.length}/500 characters</p>
                </div>

                {/* File Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-inter font-medium text-[#3C1E38] mb-2">Photo (Optional)</label>
                    <button
                      type="button"
                      onClick={() => handleFileUpload("photo")}
                      className="w-full h-32 border-2 border-dashed border-[#A7C2D7]/30 rounded-lg flex flex-col items-center justify-center hover:border-[#A7C2D7] transition-all"
                    >
                      <Camera className="w-8 h-8 text-[#A7C2D7] mb-2" />
                      <span className="font-inter text-sm text-[#3C1E38]/70">Upload your photo</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, photo: e.target.files?.[0] || null })}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-inter font-medium text-[#3C1E38] mb-2">Video (Optional)</label>
                    <button
                      type="button"
                      onClick={() => handleFileUpload("video")}
                      className="w-full h-32 border-2 border-dashed border-[#A7C2D7]/30 rounded-lg flex flex-col items-center justify-center hover:border-[#A7C2D7] transition-all"
                    >
                      <Video className="w-8 h-8 text-[#A7C2D7] mb-2" />
                      <span className="font-inter text-sm text-[#3C1E38]/70">Upload video testimonial</span>
                    </button>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={(e) => setFormData({ ...formData, video: e.target.files?.[0] || null })}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="text-center pt-6">
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] text-white font-semibold rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 mx-auto"
                  >
                    <Send className="w-5 h-5" />
                    <span>Share My Sacred Story</span>
                  </button>
                  <p className="font-inter text-sm text-[#3C1E38]/60 mt-4">
                    Your testimonial will be reviewed before publication
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
