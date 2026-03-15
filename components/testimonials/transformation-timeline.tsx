"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { Calendar, Clock, BookOpen, Heart, Sparkles, Star } from "lucide-react"

interface TimelinePointProps {
  day: number
  title: string
  description: string
  position: "left" | "right"
  icon: React.ElementType
  color: string
}

const TimelinePoint = ({ day, title, description, position, icon: Icon, color }: TimelinePointProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const pointRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.5 },
    )

    if (pointRef.current) {
      observer.observe(pointRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={pointRef}
      className={`relative ${position === "left" ? "text-right md:pr-12" : "md:pl-12"} ${
        isVisible
          ? "opacity-100 translate-y-0"
          : position === "left"
            ? "opacity-0 -translate-x-12"
            : "opacity-0 translate-x-12"
      } transition-all duration-1000 ease-out`}
    >
      {/* Timeline Point */}
      <div
        className={`absolute top-0 ${
          position === "left" ? "right-0 md:right-6" : "left-0 md:left-6"
        } w-12 h-12 rounded-full flex items-center justify-center z-10`}
        style={{ backgroundColor: color }}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Content */}
      <div
        className={`bg-white rounded-2xl p-6 shadow-lg ${
          position === "left" ? "md:mr-12" : "md:ml-12"
        } transform transition-all duration-500 hover:shadow-xl hover:scale-105`}
      >
        <div className="mb-4">
          <span
            className="inline-block px-3 py-1 rounded-full text-white text-sm font-medium"
            style={{ backgroundColor: color }}
          >
            Day {day}
          </span>
        </div>
        <h3 className="font-playfair text-xl font-bold text-[#3C1E38] mb-2">{title}</h3>
        <p className="font-inter text-[#3C1E38]/70">{description}</p>
      </div>
    </div>
  )
}

export default function TransformationTimeline() {
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
      { threshold: 0.1 },
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
            The Sacred Transformation Journey
          </h2>
          <p className="font-inter text-lg md:text-xl text-[#3C1E38]/70 max-w-2xl mx-auto">
            Experience the step-by-step journey of spiritual transformation with ALTAR
          </p>
        </div>

        <div className="relative py-12 px-4 max-w-5xl mx-auto">
          {/* Timeline Line */}
          <div
            className={`absolute left-0 md:left-1/2 top-0 bottom-0 w-1 md:transform md:-translate-x-1/2 transition-all duration-2000 ease-out ${
              isVisible ? "bg-gradient-to-b from-[#A7C2D7] to-[#F9D57E] h-full" : "h-0"
            }`}
          ></div>

          {/* Timeline Points */}
          <div className="grid grid-cols-1 gap-16">
            <TimelinePoint
              position="left"
              day={1}
              title="First Sacred Morning"
              description="Your initial setup of ALTAR guides you through establishing your first intentional morning routine with guided prayer and scripture reading."
              icon={Calendar}
              color="#A7C2D7"
            />
            <TimelinePoint
              position="right"
              day={7}
              title="Weekly Rhythm Established"
              description="By the end of your first week, you've established a consistent morning routine that includes 20 minutes of guided prayer and scripture."
              icon={Clock}
              color="#B8D4A8"
            />
            <TimelinePoint
              position="left"
              day={14}
              title="Scripture Integration"
              description="You begin to see connections between your daily scripture readings and the challenges and opportunities in your daily life."
              icon={BookOpen}
              color="#E8A5C4"
            />
            <TimelinePoint
              position="right"
              day={30}
              title="Divine Guidance Integration"
              description="Your tasks and calendar are now aligned with spiritual priorities, and you're making decisions with divine guidance."
              icon={Heart}
              color="#F9D57E"
            />
            <TimelinePoint
              position="left"
              day={60}
              title="Spiritual Breakthrough"
              description="You experience your first major spiritual breakthrough as you see God working through your newly established sacred rhythms."
              icon={Star}
              color="#D48BB8"
            />
            <TimelinePoint
              position="right"
              day={90}
              title="Complete Transformation"
              description="Your life now flows with divine rhythm and purpose. Your family and friends notice the peace and clarity that radiates from you."
              icon={Sparkles}
              color="#9BC49A"
            />
          </div>
        </div>

        {/* Testimonial Quote */}
        <div className="text-center mt-16 max-w-3xl mx-auto">
          <blockquote className="font-garamond text-xl md:text-2xl italic text-[#3C1E38]/80">
            "The transformation wasn't overnight, but ALTAR guided me through each step of the journey. Now I can't
            imagine starting my day any other way."
          </blockquote>
          <cite className="font-inter text-[#3C1E38]/60 mt-4 block">— Jennifer W., ALTAR user for 6 months</cite>
        </div>
      </div>
    </section>
  )
}
