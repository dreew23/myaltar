import Link from "next/link"
import { AlertTriangle, ArrowRight } from "lucide-react"
import { AltarIcon } from "@/components/logo-variations"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#FDFCF9]">
      <div className="w-full max-w-md text-center">
        <AltarIcon className="w-12 h-12 mx-auto mb-6" />
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-red-200/40 p-8 shadow-lg">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="font-playfair text-2xl font-bold text-[#3C1E38] mb-2">Authentication Error</h1>
          <p className="text-[#3C1E38]/60 text-sm leading-relaxed mb-6">Something went wrong during authentication. Please try again.</p>
          <Link href="/login" className="inline-flex items-center gap-2 text-[#A7C2D7] hover:underline font-medium text-sm">
            Back to sign in <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
