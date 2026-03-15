"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Clock, Pause, RefreshCw, BookOpen, AlertCircle } from "lucide-react"

export default function AIPrayerGuidance() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [selectedDuration, setSelectedDuration] = useState(5)

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const resetTimer = () => {
    setCurrentTime(0)
    setIsPlaying(false)
  }

  return (
    <Card className="w-full overflow-hidden border border-[#A7C2D7]/20">
      <CardHeader className="bg-gradient-to-r from-[#F8F4EC] to-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-[#3C1E38]">
            <Heart className="h-5 w-5 text-[#A7C2D7]" />
            <span>Prayer Guidance</span>
          </CardTitle>
          <span className="text-xs bg-[#A7C2D7]/20 text-[#3C1E38] px-2 py-1 rounded-full">Personalized</span>
        </div>
        <div className="text-sm text-[#3C1E38]/70 mt-1">Guided prayer experiences tailored to your spiritual needs</div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="bg-[#F8F4EC] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-[#A7C2D7]" />
              <h3 className="font-medium text-[#3C1E38]">Prayer Focus: Seeking Wisdom</h3>
            </div>

            <p className="text-sm text-[#3C1E38]/80 mb-3">
              Begin by acknowledging God's presence and infinite wisdom. Bring before Him the decisions you're facing,
              and ask for clarity and discernment.
            </p>

            <div className="text-xs text-[#3C1E38]/60 italic border-l-2 border-[#A7C2D7]/40 pl-3 mb-3">
              "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it
              will be given to you." — James 1:5
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-[#3C1E38]">Prayer Duration</div>
                <div className="flex gap-1">
                  {[2, 5, 10, 15].map((minutes) => (
                    <button
                      key={minutes}
                      className={`px-2 py-1 text-xs rounded ${
                        selectedDuration === minutes
                          ? "bg-[#A7C2D7] text-white"
                          : "bg-[#A7C2D7]/20 text-[#3C1E38] hover:bg-[#A7C2D7]/30"
                      }`}
                      onClick={() => setSelectedDuration(minutes)}
                    >
                      {minutes}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-[#A7C2D7]/20">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#A7C2D7]" />
                  <span className="text-lg font-medium text-[#3C1E38]">
                    {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, "0")}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#A7C2D7] text-[#A7C2D7] hover:bg-[#A7C2D7]/10"
                    onClick={togglePlay}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
                    {isPlaying ? "Pause" : "Begin"}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-[#3C1E38]/60 hover:text-[#3C1E38]"
                    onClick={resetTimer}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#A7C2D7]/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-[#A7C2D7]" />
              <h3 className="font-medium text-[#3C1E38]">Prayer Prompts</h3>
            </div>

            <ul className="space-y-2 text-sm text-[#3C1E38]/80">
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-[#A7C2D7] mt-2"></div>
                <span>Thank God for His wisdom and willingness to guide you</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-[#A7C2D7] mt-2"></div>
                <span>Bring before Him the specific decision you're facing</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-[#A7C2D7] mt-2"></div>
                <span>Ask for clarity and the ability to hear His voice</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-[#A7C2D7] mt-2"></div>
                <span>Surrender your own desires and ask for His will to be done</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-[#F8F4EC]/50 p-4 flex flex-col items-start">
        <div className="flex items-center gap-1 text-xs text-[#3C1E38]/60 mb-3">
          <AlertCircle className="h-3 w-3" />
          <span>AI guidance is a supplement to, not a replacement for, the Holy Spirit's leading.</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 text-white">
            Save Prayer Notes
          </Button>
          <Button size="sm" variant="outline" className="border-[#A7C2D7] text-[#A7C2D7] hover:bg-[#A7C2D7]/10">
            Share Prayer Request
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
