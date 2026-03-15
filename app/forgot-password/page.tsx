"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AltarIcon } from "@/components/logo-variations"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    const supabase = createClient()
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/callback?next=/app/update-password` : ""
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    })

    setIsSubmitting(false)
    if (authError) {
      setError(authError.message)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-[#FDFCF9]">
        <div className="mist-particle mist-1" />
        <div className="mist-particle mist-2" />
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#A7C2D7]/20 p-8 shadow-lg text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-emerald-100 p-3">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
            </div>
            <h1 className="font-playfair text-xl font-bold text-[#3C1E38]">Check your email</h1>
            <p className="text-[#3C1E38]/70 text-sm">
              We sent a password reset link to <strong className="text-[#3C1E38]">{email}</strong>. Click the link to set a new password.
            </p>
            <p className="text-xs text-[#3C1E38]/50">If you don’t see it, check your spam folder.</p>
            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-[#A7C2D7] hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-[#FDFCF9]">
      <div className="mist-particle mist-1" />
      <div className="mist-particle mist-2" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <AltarIcon className="w-12 h-12 mb-4" />
          <h1 className="font-playfair text-3xl font-bold text-[#3C1E38]">Reset password</h1>
          <p className="text-[#3C1E38]/60 mt-2 font-inter text-sm">Enter your email and we’ll send you a link to set a new password.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#A7C2D7]/20 p-8 shadow-lg space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#3C1E38] mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3C1E38]/40" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 border border-[#A7C2D7]/30 rounded-lg bg-white focus:ring-2 focus:ring-[#A7C2D7]/50 focus:border-[#A7C2D7] outline-none transition text-[#3C1E38]"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#A7C2D7] to-[#A7C2D7]/80 text-white py-2.5 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Sending link...</>
            ) : (
              "Send reset link"
            )}
          </Button>

          <p className="text-center">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-[#A7C2D7] hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
