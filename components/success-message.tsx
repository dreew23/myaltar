"use client"

import { useEffect, useState } from "react"
import { CheckCircle, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SuccessMessageProps {
  title: string
  message: string
  isVisible: boolean
  onClose: () => void
  autoClose?: boolean
  duration?: number
}

export default function SuccessMessage({
  title,
  message,
  isVisible,
  onClose,
  autoClose = true,
  duration = 5000,
}: SuccessMessageProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShow(true)
      if (autoClose) {
        const timer = setTimeout(() => {
          setShow(false)
          setTimeout(onClose, 300) // Wait for animation to complete
        }, duration)
        return () => clearTimeout(timer)
      }
    } else {
      setShow(false)
    }
  }, [isVisible, autoClose, duration, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div
        className={`relative bg-white rounded-2xl p-8 max-w-md mx-auto shadow-2xl border border-[#A7C2D7]/20 transform transition-all duration-300 ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <Sparkles className="w-6 h-6 text-[#F9D57E] absolute -top-1 -right-1 animate-pulse" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="font-playfair text-xl font-bold text-[#3C1E38] mb-3">{title}</h3>
          <p className="font-inter text-[#3C1E38]/70 mb-6 leading-relaxed">{message}</p>
          <Button onClick={onClose} className="bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 text-black font-inter px-6 py-2">
            Continue Your Journey
          </Button>
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#A7C2D7]/5 to-[#F9D57E]/5 rounded-2xl pointer-events-none"></div>
      </div>
    </div>
  )
}
