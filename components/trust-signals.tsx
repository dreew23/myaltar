"use client"

import { Shield, Award, Users, Clock } from "lucide-react"

const trustSignals = [
  {
    icon: Shield,
    title: "Privacy Protected",
    description: "Your spiritual journey remains sacred and secure",
  },
  {
    icon: Award,
    title: "Faith-Based Design",
    description: "Created by believers, for believers",
  },
  {
    icon: Users,
    title: "8,000+ Sacred Companions",
    description: "Join a growing community of faithful women",
  },
  {
    icon: Clock,
    title: "5-Minute Setup",
    description: "Begin your sacred journey in minutes",
  },
]

export default function TrustSignals() {
  return (
    <section className="py-8 bg-white/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustSignals.map((signal, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#A7C2D7]/10 flex items-center justify-center mx-auto mb-3">
                <signal.icon className="w-6 h-6 text-[#A7C2D7]" />
              </div>
              <h3 className="font-playfair text-sm font-semibold text-[#3C1E38] mb-1">{signal.title}</h3>
              <p className="font-inter text-xs text-[#3C1E38]/60">{signal.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
