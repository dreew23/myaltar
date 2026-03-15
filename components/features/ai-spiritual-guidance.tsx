"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, BookOpen, Heart, Clock, AlertCircle } from "lucide-react"

export default function AISpiritualGuidance() {
  const [activeTab, setActiveTab] = useState("insights")

  return (
    <Card className="w-full overflow-hidden border border-[#A7C2D7]/20">
      <CardHeader className="bg-gradient-to-r from-[#F8F4EC] to-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-[#3C1E38]">
            <Sparkles className="h-5 w-5 text-[#A7C2D7]" />
            <span>AI Spiritual Guidance</span>
          </CardTitle>
          <span className="text-xs bg-[#A7C2D7]/20 text-[#3C1E38] px-2 py-1 rounded-full">Personalized</span>
        </div>
        <div className="text-sm text-[#3C1E38]/70 mt-1">Receive divine wisdom tailored to your spiritual journey</div>
      </CardHeader>

      <div className="flex border-b border-[#A7C2D7]/10">
        {[
          { id: "insights", label: "Insights", icon: <Sparkles className="h-4 w-4" /> },
          { id: "scripture", label: "Scripture", icon: <BookOpen className="h-4 w-4" /> },
          { id: "prayer", label: "Prayer", icon: <Heart className="h-4 w-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center gap-1 px-4 py-2 text-sm font-medium ${
              activeTab === tab.id
                ? "border-b-2 border-[#A7C2D7] text-[#3C1E38]"
                : "text-[#3C1E38]/60 hover:text-[#3C1E38]/80"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <CardContent className="p-4">
        {activeTab === "insights" && (
          <div className="space-y-4">
            <div className="bg-[#F8F4EC] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-[#A7C2D7]" />
                <h3 className="font-medium text-[#3C1E38]">Spiritual Insight</h3>
                <span className="text-xs bg-[#A7C2D7]/20 text-[#3C1E38] px-2 py-0.5 rounded-full ml-auto">
                  98% confidence
                </span>
              </div>
              <p className="text-sm text-[#3C1E38]/80">
                Your prayer patterns show a deep desire for wisdom in decision-making. Consider incorporating a moment
                of stillness before each prayer to create space for divine guidance.
              </p>
            </div>

            <div className="bg-white border border-[#A7C2D7]/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-[#A7C2D7]" />
                <h3 className="font-medium text-[#3C1E38]">Spiritual Season</h3>
                <span className="text-xs bg-[#A7C2D7]/20 text-[#3C1E38] px-2 py-0.5 rounded-full ml-auto">
                  87% confidence
                </span>
              </div>
              <p className="text-sm text-[#3C1E38]/80">
                You appear to be in a season of growth and preparation. This is an ideal time to deepen your spiritual
                disciplines and establish new sacred rhythms.
              </p>
            </div>
          </div>
        )}

        {activeTab === "scripture" && (
          <div className="space-y-4">
            <div className="bg-[#F8F4EC] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-[#A7C2D7]" />
                <h3 className="font-medium text-[#3C1E38]">Recommended Scripture</h3>
              </div>
              <p className="text-sm text-[#3C1E38]/80 italic">
                "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit
                to him, and he will make your paths straight." — Proverbs 3:5-6
              </p>
              <p className="text-xs text-[#3C1E38]/60 mt-2">
                This verse aligns with your current focus on seeking wisdom for decisions.
              </p>
            </div>

            <div className="bg-white border border-[#A7C2D7]/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-[#A7C2D7]" />
                <h3 className="font-medium text-[#3C1E38]">Study Suggestion</h3>
              </div>
              <p className="text-sm text-[#3C1E38]/80">
                Consider a 7-day study on wisdom in the book of James, which offers practical guidance for applying
                faith to daily decisions.
              </p>
            </div>
          </div>
        )}

        {activeTab === "prayer" && (
          <div className="space-y-4">
            <div className="bg-[#F8F4EC] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-[#A7C2D7]" />
                <h3 className="font-medium text-[#3C1E38]">Prayer Focus</h3>
              </div>
              <p className="text-sm text-[#3C1E38]/80">
                Based on your recent entries, a prayer for discernment would be beneficial:
              </p>
              <p className="text-sm text-[#3C1E38]/80 italic mt-2">
                "Lord, grant me the wisdom to hear Your voice clearly amidst the noise of my daily life. Guide my
                decisions with Your perfect wisdom, and help me to trust Your timing even when the path isn't clear."
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-[#F8F4EC]/50 p-4 flex flex-col items-start">
        <div className="flex items-center gap-1 text-xs text-[#3C1E38]/60 mb-3">
          <AlertCircle className="h-3 w-3" />
          <span>AI guidance is a supplement to, not a replacement for, prayer and scripture.</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 text-white">
            Apply Insight
          </Button>
          <Button size="sm" variant="outline" className="border-[#A7C2D7] text-[#A7C2D7] hover:bg-[#A7C2D7]/10">
            Save for Later
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
