"use client"

import { type LucideIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SectionCardProps {
  id: string
  icon: LucideIcon
  iconBg?: string
  iconColor?: string
  title: string
  subtitle: string
  children: React.ReactNode
}

export function SectionCard({
  id,
  icon: Icon,
  iconBg = "bg-[#A7C2D7]/10",
  iconColor = "text-[#3C1E38]",
  title,
  subtitle,
  children,
}: SectionCardProps) {
  return (
    <Card id={id} className="border-[#A7C2D7]/20 bg-white">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div>
            <CardTitle className="font-playfair text-[#3C1E38]">{title}</CardTitle>
            <CardDescription className="text-[#3C1E38]/60">{subtitle}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
