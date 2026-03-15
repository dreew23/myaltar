import type { Metadata } from "next"
import { Heart, Sparkles, Star, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About ALTAR - Sacred Technology for Divine Living",
  description:
    "Learn about ALTAR's mission to help women integrate faith and productivity through divine-guided planning and spiritual growth tools.",
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#FDFCF9]">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-[#FBF8F3] to-[#FDFCF9]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Heart className="w-8 h-8 text-[#A7C2D7] mr-3" />
              <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-[#3C1E38]">
                Our Sacred Mission
              </h1>
              <Heart className="w-8 h-8 text-[#A7C2D7] ml-3" />
            </div>
            <p className="font-inter text-xl md:text-2xl text-[#3C1E38]/70 leading-relaxed">
              Bridging the gap between heaven and earth through divine technology that honors both spiritual calling and
              practical living.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-[#A7C2D7]/20">
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#3C1E38] mb-8 text-center">
                Born from Sacred Frustration
              </h2>

              <div className="prose prose-lg max-w-none">
                <p className="font-inter text-[#3C1E38]/70 leading-relaxed mb-6">
                  ALTAR was born in the quiet hours before dawn, when the founder—a woman of deep faith and ambitious
                  dreams— found herself struggling to reconcile her spiritual calling with the demands of modern
                  productivity culture.
                </p>

                <p className="font-inter text-[#3C1E38]/70 leading-relaxed mb-6">
                  Traditional planning tools felt hollow, focused solely on efficiency and achievement without regard
                  for divine timing, spiritual seasons, or the sacred rhythms that govern a life surrendered to God.
                  Prayer journals sat separate from daily planners, creating a disconnect between spiritual life and
                  practical living.
                </p>

                <blockquote className="font-playfair text-xl md:text-2xl italic text-[#3C1E38] text-center my-8 py-6 border-l-4 border-[#A7C2D7] pl-6">
                  "What if our daily planning could become an act of worship? What if our to-do lists could reflect our
                  spiritual priorities? What if technology could serve not just productivity, but sanctification?"
                </blockquote>

                <p className="font-inter text-[#3C1E38]/70 leading-relaxed mb-6">
                  These questions led to countless early mornings spent in prayer, seeking divine guidance for a
                  solution that would honor both the practical needs of modern women and the timeless call to live a
                  life pleasing to God.
                </p>

                <p className="font-inter text-[#3C1E38]/70 leading-relaxed">
                  ALTAR emerged as the answer—not just another app, but a sacred companion designed to help women
                  integrate their faith into every aspect of daily living, transforming ordinary moments into
                  opportunities for divine connection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-[#FBF8F3]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#3C1E38] mb-4">Our Sacred Values</h2>
              <p className="font-inter text-lg text-[#3C1E38]/70 max-w-2xl mx-auto">
                Every feature, every design decision, every line of code is guided by these foundational principles
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-8 shadow-lg border border-[#A7C2D7]/20 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E] flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-playfair text-xl font-semibold text-[#3C1E38] mb-4">Faith-First Design</h3>
                <p className="font-inter text-[#3C1E38]/70 leading-relaxed">
                  Every feature begins with prayer and is designed to deepen your relationship with God, not just
                  increase productivity.
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg border border-[#A7C2D7]/20 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E] flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-playfair text-xl font-semibold text-[#3C1E38] mb-4">Grace Over Guilt</h3>
                <p className="font-inter text-[#3C1E38]/70 leading-relaxed">
                  We believe in progress, not perfection. Our tools encourage growth while extending the same grace God
                  shows us daily.
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg border border-[#A7C2D7]/20 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E] flex items-center justify-center mx-auto mb-6">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-playfair text-xl font-semibold text-[#3C1E38] mb-4">Sacred Excellence</h3>
                <p className="font-inter text-[#3C1E38]/70 leading-relaxed">
                  We pursue excellence as an act of worship, creating beautiful, functional tools worthy of the sacred
                  work they support.
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg border border-[#A7C2D7]/20 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E] flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-playfair text-xl font-semibold text-[#3C1E38] mb-4">Community & Connection</h3>
                <p className="font-inter text-[#3C1E38]/70 leading-relaxed">
                  We foster authentic relationships between women on similar spiritual journeys, creating space for
                  encouragement and growth.
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg border border-[#A7C2D7]/20 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E] flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-playfair text-xl font-semibold text-[#3C1E38] mb-4">Privacy & Sanctity</h3>
                <p className="font-inter text-[#3C1E38]/70 leading-relaxed">
                  Your spiritual journey is sacred. We protect your privacy with the same reverence we'd show a prayer
                  closet.
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg border border-[#A7C2D7]/20 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E] flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-playfair text-xl font-semibold text-[#3C1E38] mb-4">Divine Innovation</h3>
                <p className="font-inter text-[#3C1E38]/70 leading-relaxed">
                  We seek God's wisdom in every innovation, creating technology that serves His purposes and glorifies
                  His name.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#3C1E38] mb-8">
              Our Vision for the Future
            </h2>
            <div className="bg-gradient-to-br from-[#A7C2D7]/10 to-[#F9D57E]/10 rounded-3xl p-8 md:p-12">
              <p className="font-inter text-lg md:text-xl text-[#3C1E38]/70 leading-relaxed mb-6">
                We envision a world where technology serves not just efficiency, but sanctification. Where women
                everywhere can seamlessly integrate their faith into their daily planning, finding divine purpose in
                ordinary moments.
              </p>
              <p className="font-playfair text-xl md:text-2xl italic text-[#3C1E38] leading-relaxed">
                "Our dream is to see a generation of women who rise before dawn not just to be productive, but to touch
                heaven—and carry that sacred connection throughout their day."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[#FBF8F3]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#3C1E38] mb-6">
              Join Our Sacred Mission
            </h2>
            <p className="font-inter text-lg text-[#3C1E38]/70 mb-8 max-w-2xl mx-auto">
              Be part of a movement that's transforming how women of faith approach daily living
            </p>
            <Button
              asChild
              className="bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 hover:shadow-[0_0_20px_rgba(249,213,126,0.6)] text-black font-inter text-lg px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              <Link href="/#email-signup">Begin Your Sacred Journey</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
