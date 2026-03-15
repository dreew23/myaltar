"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

export default function AIContentGeneration() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#A7C2D7]" />
          <span>AI Content Generation</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center p-6">
          <p className="text-[#3C1E38]/70">AI content generation component placeholder</p>
        </div>
      </CardContent>
    </Card>
  )
}
