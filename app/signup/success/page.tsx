import Link from "next/link"
import { Mail, ArrowRight } from "lucide-react"
import { AltarIcon } from "@/components/logo-variations"

export default function SignupSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#FDFCF9]">
      <div className="w-full max-w-md text-center">
        <AltarIcon className="w-12 h-12 mx-auto mb-6" />
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#A7C2D7]/20 p-8 shadow-lg">
          <div className="w-16 h-16 bg-[#A7C2D7]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-[#A7C2D7]" />
          </div>
          <h1 className="font-playfair text-2xl font-bold text-[#3C1E38] mb-2">Check Your Email</h1>
          <p className="text-[#3C1E38]/60 text-sm leading-relaxed mb-6">
            We have sent a confirmation link to your email address. Please click the link to activate your sacred space.
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 text-[#A7C2D7] hover:underline font-medium text-sm">
            Return to sign in <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
