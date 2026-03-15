"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Moon } from "lucide-react"

export default function DarkMode() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Moon className="h-5 w-5 text-[#A7C2D7]" />
          <span>Dark Mode</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center p-6">
          <p className="text-[#3C1E38]/70">Dark mode component placeholder</p>
        </div>
      </CardContent>
    </Card>
  )
}
