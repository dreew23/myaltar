"use client"

import { useRef, useEffect, useState } from "react"
import { MapPinIcon, Users } from "lucide-react"

const testimonialLocations = [
  { id: 1, lat: 40, lng: -74, name: "Sarah M.", location: "New York", count: 124 },
  { id: 2, lat: 34, lng: -118, name: "Jennifer L.", location: "Los Angeles", count: 98 },
  { id: 3, lat: 41, lng: -87, name: "Rebecca J.", location: "Chicago", count: 76 },
  { id: 4, lat: 29, lng: -95, name: "Maria R.", location: "Houston", count: 65 },
  { id: 5, lat: 33, lng: -84, name: "Grace T.", location: "Atlanta", count: 58 },
  { id: 6, lat: 47, lng: -122, name: "Michelle S.", location: "Seattle", count: 52 },
  { id: 7, lat: 39, lng: -104, name: "Amanda F.", location: "Denver", count: 47 },
  { id: 8, lat: 25, lng: -80, name: "Nicole P.", location: "Miami", count: 43 },
  { id: 9, lat: 32, lng: -96, name: "Jessica H.", location: "Dallas", count: 39 },
  { id: 10, lat: 37, lng: -122, name: "Ashley M.", location: "San Francisco", count: 36 },
  { id: 11, lat: 36, lng: -86, name: "Lauren W.", location: "Nashville", count: 31 },
  { id: 12, lat: 44, lng: -93, name: "Emily R.", location: "Minneapolis", count: 28 },
]

interface MapPinProps {
  lat: number
  lng: number
  size: number
  onClick: () => void
  isActive: boolean
}

const MapPin = ({ lat, lng, size, onClick, isActive }: MapPinProps) => {
  // Convert lat/lng to x/y coordinates (simple approximation for demo)
  const x = ((lng + 180) / 360) * 100
  const y = ((90 - lat) / 180) * 100

  return (
    <button
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
        isActive ? "z-20" : "z-10"
      }`}
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={onClick}
    >
      <div
        className={`rounded-full flex items-center justify-center transition-all duration-300 ${
          isActive ? "bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] shadow-lg scale-125" : "bg-[#A7C2D7] hover:scale-110"
        }`}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <MapPinIcon className={`w-${size / 2} h-${size / 2} text-white`} />
      </div>
      {isActive && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-lg p-3 w-48 z-30">
          <div className="text-center">
            <span className="block font-playfair font-bold text-[#3C1E38]">
              {testimonialLocations.find((loc) => loc.lat === lat && loc.lng === lng)?.name}
            </span>
            <span className="block text-sm text-[#3C1E38]/70">
              {testimonialLocations.find((loc) => loc.lat === lat && loc.lng === lng)?.location}
            </span>
            <div className="flex items-center justify-center space-x-1 mt-1">
              <Users className="w-3 h-3 text-[#A7C2D7]" />
              <span className="text-xs text-[#3C1E38]/60">
                {testimonialLocations.find((loc) => loc.lat === lat && loc.lng === lng)?.count} testimonials
              </span>
            </div>
          </div>
        </div>
      )}
    </button>
  )
}

export default function TestimonialMap() {
  const [activeLocation, setActiveLocation] = useState<number | null>(null)
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

  useEffect(() => {
    // Randomly highlight different locations
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * testimonialLocations.length)
      setActiveLocation((testimonIndex) =>
        randomIndex === testimonialLocations.findIndex((loc) => loc.id === testimonIndex)
          ? null
          : testimonialLocations[randomIndex].id,
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-white/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-[#3C1E38] mb-4">
            A Global Sacred Community
          </h2>
          <p className="font-inter text-lg md:text-xl text-[#3C1E38]/70 max-w-2xl mx-auto">
            Women around the world are experiencing divine transformation through ALTAR
          </p>
        </div>

        <div
          className={`max-w-5xl mx-auto transform transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
        >
          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Map Background */}
            <div className="relative aspect-[16/9] bg-[#F9F7F4]">
              <img
                src="/placeholder.svg?height=600&width=1000"
                alt="World map"
                className="w-full h-full object-cover opacity-80"
                crossOrigin="anonymous"
              />

              {/* Map Pins */}
              {testimonialLocations.map((location) => (
                <MapPin
                  key={location.id}
                  lat={location.lat}
                  lng={location.lng}
                  size={location.count > 50 ? 24 : location.count > 30 ? 20 : 16}
                  onClick={() => setActiveLocation(location.id === activeLocation ? null : location.id)}
                  isActive={location.id === activeLocation}
                />
              ))}

              {/* Glowing Connections */}
              <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1000')] bg-cover opacity-30"></div>
            </div>

            {/* Stats Bar */}
            <div className="bg-gradient-to-r from-[#A7C2D7]/10 to-[#F9D57E]/10 p-6 flex flex-wrap justify-around">
              <div className="text-center px-4 py-2">
                <div className="font-playfair text-2xl md:text-3xl font-bold text-[#3C1E38]">8,000+</div>
                <div className="font-inter text-sm text-[#3C1E38]/70">Women Transformed</div>
              </div>
              <div className="text-center px-4 py-2">
                <div className="font-playfair text-2xl md:text-3xl font-bold text-[#3C1E38]">52</div>
                <div className="font-inter text-sm text-[#3C1E38]/70">Countries</div>
              </div>
              <div className="text-center px-4 py-2">
                <div className="font-playfair text-2xl md:text-3xl font-bold text-[#3C1E38]">1,200+</div>
                <div className="font-inter text-sm text-[#3C1E38]/70">Cities</div>
              </div>
              <div className="text-center px-4 py-2">
                <div className="font-playfair text-2xl md:text-3xl font-bold text-[#3C1E38]">4.9/5</div>
                <div className="font-inter text-sm text-[#3C1E38]/70">Average Rating</div>
              </div>
            </div>
          </div>

          {/* Featured Locations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {testimonialLocations.slice(0, 3).map((location) => (
              <div
                key={location.id}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => setActiveLocation(location.id)}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] flex items-center justify-center">
                    <MapPinIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-playfair font-bold text-[#3C1E38]">{location.location}</h3>
                    <p className="font-inter text-sm text-[#3C1E38]/60">{location.count} testimonials</p>
                  </div>
                </div>
                <p className="font-inter text-sm text-[#3C1E38]/70">
                  "ALTAR has transformed our local women's ministry. We now have a shared language for divine guidance."
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
