"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AltarIcon } from "@/components/logo-variations"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setIsSubmitting(false)
      return
    }

    // Full navigation so proxy and Server Components see the new session cookies (client router.push can race).
    window.location.assign("/app/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-[#FDFCF9]">
      <div className="mist-particle mist-1" />
      <div className="mist-particle mist-2" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <AltarIcon className="w-12 h-12 mb-4" />
          <h1 className="font-playfair text-3xl font-bold text-[#3C1E38]">Welcome Back</h1>
          <p className="text-[#3C1E38]/60 mt-2 font-inter text-sm">Return to your sacred space</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#A7C2D7]/20 p-8 shadow-lg space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#3C1E38] mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-[#A7C2D7]/30 rounded-lg bg-white focus:ring-2 focus:ring-[#A7C2D7]/50 focus:border-[#A7C2D7] outline-none transition text-[#3C1E38]"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-[#3C1E38]">Password</label>
              <Link href="/forgot-password" className="text-xs text-[#A7C2D7] hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-[#A7C2D7]/30 rounded-lg bg-white focus:ring-2 focus:ring-[#A7C2D7]/50 focus:border-[#A7C2D7] outline-none transition pr-10 text-[#3C1E38]"
                placeholder="Enter your password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3C1E38]/40 hover:text-[#3C1E38]/70">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#A7C2D7] to-[#A7C2D7]/80 text-white py-2.5 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><Sparkles className="w-4 h-4 animate-spin" /> Entering sacred space...</>
            ) : (
              <>Enter Your Altar <ArrowRight className="w-4 h-4" /></>
            )}
          </Button>

          <p className="text-center text-sm text-[#3C1E38]/60">
            {"Don't have an account? "}
            <Link href="/signup" className="text-[#A7C2D7] hover:underline font-medium">Create one</Link>
          </p>
        </form>

        <p className="text-center mt-6 text-xs text-[#3C1E38]/40 font-garamond italic">
          {"\"Come to me, all you who are weary and burdened, and I will give you rest.\" -- Matthew 11:28"}
        </p>
      </div>
    </div>
  )
}
