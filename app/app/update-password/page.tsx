"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2, Lock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    setIsSubmitting(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.updateUser({ password })

    setIsSubmitting(false)
    if (authError) {
      setError(authError.message)
      toast.error(authError.message)
      return
    }
    toast.success("Password updated")
    router.push("/app/settings")
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#FDFCF9]">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link href="/app/settings" className="inline-flex items-center gap-2 text-sm text-[#3C1E38]/60 hover:text-[#A7C2D7]">
            <ArrowLeft className="w-4 h-4" /> Back to Settings
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-[#A7C2D7]/20 p-8 shadow-lg space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#A7C2D7]/10">
              <Lock className="h-5 w-5 text-[#3C1E38]" />
            </div>
            <div>
              <h1 className="font-playfair text-xl font-bold text-[#3C1E38]">Change password</h1>
              <p className="text-sm text-[#3C1E38]/60">Set a new password for your account.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#3C1E38] mb-1.5">New password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 border border-[#A7C2D7]/30 rounded-lg bg-white focus:ring-2 focus:ring-[#A7C2D7]/50 focus:border-[#A7C2D7] outline-none transition pr-10 text-[#3C1E38]"
                  placeholder="At least 8 characters"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3C1E38]/40 hover:text-[#3C1E38]/70">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-[#3C1E38]/50 mt-1">Use at least 8 characters, with uppercase and a number.</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#3C1E38] mb-1.5">Confirm new password</label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2.5 border border-[#A7C2D7]/30 rounded-lg bg-white focus:ring-2 focus:ring-[#A7C2D7]/50 focus:border-[#A7C2D7] outline-none transition text-[#3C1E38]"
                placeholder="Re-enter password"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38] font-medium"
            >
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Updating...</> : "Update password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
