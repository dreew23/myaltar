"use client"

import type React from "react"

import { BookOpen, Flame, Compass, Heart, Star, Sun } from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "Daily Devotionals",
    description: "Curated scripture readings and reflections to start your day with purpose.",
  },
  {
    icon: Flame,
    title: "Prayer Guidance",
    description: "Structured prayer prompts that deepen your connection with the divine.",
  },
  {
    icon: Compass,
    title: "Spiritual Direction",
    description: "Personalized guidance to navigate your unique faith journey with clarity.",
  },
  {
    icon: Heart,
    title: "Reflection Prompts",
    description: "Thoughtful questions that transform daily experiences into spiritual insights.",
  },
  {
    icon: Star,
    title: "Sacred Goals",
    description: "Set and track meaningful intentions aligned with your spiritual values.",
  },
  {
    icon: Sun,
    title: "Morning Rituals",
    description: "Gentle practices to create sacred space in your early hours.",
  },
]

export default function FeaturesGrid() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            Sacred Tools for Daily Growth
          </h2>
          <p className="font-inter text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the features that transform your morning moments into meaningful spiritual practice
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  index: number
}

function FeatureCard({ icon: Icon, title, description, index }: FeatureCardProps) {
  return (
    <div
      className="group relative bg-[#FBF8F3] rounded-lg p-6 transition-all duration-500 ease-out hover:scale-105 hover:shadow-[0_20px_40px_rgba(167,194,215,0.15)] cursor-pointer border border-transparent hover:border-[#A7C2D7]/20"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Ambient glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#A7C2D7]/5 to-[#F9D57E]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
          <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center group-hover:bg-white transition-colors duration-300 shadow-sm group-hover:shadow-md">
            <Icon
              className="w-6 h-6 text-[#A7C2D7] group-hover:text-[#A7C2D7]/80 transition-colors duration-300"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Title */}
        <h3 className="font-playfair text-xl md:text-2xl font-semibold text-gray-800 mb-3 group-hover:text-gray-900 transition-colors duration-300">
          {title}
        </h3>

        {/* Description */}
        <p className="font-inter text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
          {description}
        </p>

        {/* Subtle bottom accent */}
        <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#A7C2D7]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute top-4 right-4 w-1 h-1 bg-[#F9D57E]/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:animate-pulse"></div>
      <div className="absolute top-8 right-8 w-1 h-1 bg-[#A7C2D7]/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 delay-200 group-hover:animate-pulse"></div>
    </div>
  )
}
