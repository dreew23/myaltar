"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Sparkles, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AltarIcon } from "@/components/logo-variations"
import { createClient } from "@/lib/supabase/client"

const rhythms = ["Morning Dawn", "Midday Reflection", "Evening Vespers", "Night Watch"]

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "", rhythm: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const rules = [
    { label: "At least 8 characters", met: form.password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(form.password) },
    { label: "One number", met: /\d/.test(form.password) },
  ]
  const allMet = rules.every((r) => r.met)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allMet) return
    setError("")
    setIsSubmitting(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo:
          process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
            ? process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
            : `${window.location.origin}/auth/callback`,
        data: { display_name: form.name, sacred_rhythm: form.rhythm || null },
      },
    })

    if (authError) {
      setError(authError.message)
      setIsSubmitting(false)
      return
    }

    router.push("/signup/success")
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-[#FDFCF9]">
      <div className="mist-particle mist-1" />
      <div className="mist-particle mist-3" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <AltarIcon className="w-12 h-12 mb-4" />
          <h1 className="font-playfair text-3xl font-bold text-[#3C1E38]">Begin Your Sacred Journey</h1>
          <p className="text-[#3C1E38]/60 mt-2 font-inter text-sm">Create your ALTAR account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#A7C2D7]/20 p-8 shadow-lg space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#3C1E38] mb-1.5">Full Name</label>
            <input id="name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2.5 border border-[#A7C2D7]/30 rounded-lg bg-white focus:ring-2 focus:ring-[#A7C2D7]/50 focus:border-[#A7C2D7] outline-none transition text-[#3C1E38]" placeholder="Your full name" />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#3C1E38] mb-1.5">Email</label>
            <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full px-4 py-2.5 border border-[#A7C2D7]/30 rounded-lg bg-white focus:ring-2 focus:ring-[#A7C2D7]/50 focus:border-[#A7C2D7] outline-none transition text-[#3C1E38]" placeholder="your@email.com" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#3C1E38] mb-1.5">Password</label>
            <div className="relative">
              <input id="password" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="w-full px-4 py-2.5 border border-[#A7C2D7]/30 rounded-lg bg-white focus:ring-2 focus:ring-[#A7C2D7]/50 focus:border-[#A7C2D7] outline-none transition pr-10 text-[#3C1E38]" placeholder="Create a password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3C1E38]/40 hover:text-[#3C1E38]/70">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="mt-2 space-y-1">
              {rules.map((r) => (
                <div key={r.label} className={`flex items-center gap-2 text-xs ${r.met ? "text-emerald-600" : "text-[#3C1E38]/40"}`}>
                  <Check className={`w-3 h-3 ${r.met ? "opacity-100" : "opacity-30"}`} /> {r.label}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="rhythm" className="block text-sm font-medium text-[#3C1E38] mb-1.5">Sacred Rhythm <span className="text-[#3C1E38]/40">(optional)</span></label>
            <select id="rhythm" value={form.rhythm} onChange={(e) => setForm({ ...form, rhythm: e.target.value })} className="w-full px-4 py-2.5 border border-[#A7C2D7]/30 rounded-lg bg-white focus:ring-2 focus:ring-[#A7C2D7]/50 focus:border-[#A7C2D7] outline-none transition text-[#3C1E38]">
              <option value="">Choose your preferred time...</option>
              {rhythms.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <Button type="submit" disabled={isSubmitting || !allMet} className="w-full bg-gradient-to-r from-[#A7C2D7] to-[#A7C2D7]/80 text-white py-2.5 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {isSubmitting ? (
              <><Sparkles className="w-4 h-4 animate-spin" /> Preparing your altar...</>
            ) : (
              <>Create Account <ArrowRight className="w-4 h-4" /></>
            )}
          </Button>

          <p className="text-center text-sm text-[#3C1E38]/60">
            Already have an account?{" "}
            <Link href="/login" className="text-[#A7C2D7] hover:underline font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
