"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { User as UserIcon, Settings, Bell, Shield, LogOut, Trash2, Check, Loader2, Lock, ArrowRight, Smartphone } from "lucide-react"
import { SectionCard } from "@/components/app/settings/section-card"
import { PersonalYearConfig } from "@/components/app/settings/personal-year-config"
import { QuarterConfig } from "@/components/app/settings/quarter-config"
import { IntercessionEditor } from "@/components/app/settings/intercession-editor"
import { GoalEditor } from "@/components/app/settings/goal-editor"
import { NotificationsSection } from "@/components/app/settings/notifications-section"
import { DataManagement } from "@/components/app/settings/data-management"
import type { QuarterRow } from "@/components/app/settings/quarter-config"
import type { PersonalYearConfigRow } from "@/lib/personal-year"
import type { IntercessionDayRow } from "@/components/app/settings/intercession-editor"
import type { GoalRow } from "@/components/app/settings/goal-editor"
import type { NotificationPrefs } from "@/components/app/settings/notifications-section"

interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  sacred_rhythm: string | null
  spiritual_season: string | null
}

interface SettingsClientProps {
  user: User
  profile: Profile | null
  personalYears: PersonalYearConfigRow[]
  quarters: QuarterRow[]
  intercessionSchedule: IntercessionDayRow[] | null
  goals: GoalRow[] | null
  notificationPrefs: NotificationPrefs | null
  storageCounts: Record<string, number>
  quarterStartStr: string
  quarterEndStr: string
  quarterCode: string
}

const DOMINION_RHYTHMS = [
  { value: "5am", label: "5 AM Watch - First fruits of the day" },
  { value: "6am", label: "6 AM Start - Dawn declarations" },
  { value: "morning", label: "Morning Block - 7-9 AM sacred time" },
  { value: "flexible", label: "Flexible - As the Spirit leads" },
]

const FOCUS_AREAS = [
  { value: "business", label: "Business Dominion - Kingdom enterprise focus" },
  { value: "ministry", label: "Ministry Building - Spiritual leadership" },
  { value: "family", label: "Family Legacy - Generational blessing" },
  { value: "creative", label: "Creative Calling - Arts & innovation" },
  { value: "balanced", label: "Balanced Growth - All areas equally" },
]

const SECTIONS = [
  { id: "profile", label: "Profile" },
  { id: "dominion-rhythm", label: "DOMINION Rhythm" },
  { id: "primary-focus", label: "Primary Focus Area" },
  { id: "personal-year-config", label: "Personal Year" },
  { id: "quarter-config", label: "System Calendar" },
  { id: "intercession-schedule", label: "Intercession Schedule" },
  { id: "goal-config", label: "Goal Configuration" },
  { id: "notifications", label: "Notifications" },
  { id: "data-management", label: "Data Management" },
  { id: "account", label: "Account" },
]

export default function SettingsClient({
  user,
  profile,
  personalYears,
  quarters,
  intercessionSchedule,
  goals,
  notificationPrefs,
  storageCounts,
  quarterStartStr,
  quarterEndStr,
  quarterCode,
}: SettingsClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [displayName, setDisplayName] = useState(profile?.display_name || "")
  const [sacredRhythm, setSacredRhythm] = useState(profile?.sacred_rhythm || "")
  const [spiritualSeason, setSpiritualSeason] = useState(profile?.spiritual_season || "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [isPWAInstalled, setIsPWAInstalled] = useState<boolean | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const mq = window.matchMedia("(display-mode: standalone)")
    const check = () => setIsPWAInstalled(mq.matches || (window.navigator as { standalone?: boolean }).standalone === true)
    check()
    mq.addEventListener("change", check)
    return () => mq.removeEventListener("change", check)
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    setSaved(false)
    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        display_name: displayName.trim() || null,
        sacred_rhythm: sacredRhythm || null,
        spiritual_season: spiritualSeason || null,
      },
      { onConflict: "id" }
    )
    setSaving(false)
    if (error) {
      toast.error("Could not save — " + error.message)
      return
    }
    setSaved(true)
    toast.success("Profile saved")
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sticky ToC — desktop only */}
      <aside className="hidden lg:block w-44 shrink-0">
        <nav className="sticky top-24 space-y-1 text-sm">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="block py-1.5 text-[#3C1E38]/70 hover:text-[#A7C2D7] transition-colors"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </aside>

      <main className="flex-1 min-w-0 space-y-6">
        {/* Install ALTAR on your device */}
        <Card id="install-pwa" className="border-[#A7C2D7]/20 bg-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F9D57E]/20">
                <Smartphone className="h-5 w-5 text-[#3C1E38]" />
              </div>
              <div>
                <CardTitle className="font-playfair text-[#3C1E38]">Install ALTAR on your device</CardTitle>
                <CardDescription className="text-[#3C1E38]/60">
                  Use ALTAR from your home screen for quick access at 3am and offline.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isPWAInstalled === true ? (
              <p className="text-sm text-emerald-600 font-medium flex items-center gap-2">
                <Check className="h-4 w-4" />
                ALTAR is installed ✓
              </p>
            ) : isPWAInstalled === false ? (
              <ul className="text-sm text-[#3C1E38]/80 space-y-2 list-disc list-inside">
                <li>
                  <strong>iOS:</strong> Tap the share button → Add to Home Screen
                </li>
                <li>
                  <strong>Android:</strong> Tap the menu → Install App
                </li>
              </ul>
            ) : (
              <p className="text-sm text-[#3C1E38]/50">Checking…</p>
            )}
          </CardContent>
        </Card>

        {/* 1. Profile */}
        <Card id="profile" className="border-[#A7C2D7]/20 bg-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#A7C2D7]/10">
                <UserIcon className="h-5 w-5 text-[#3C1E38]" />
              </div>
              <div>
                <CardTitle className="font-playfair text-[#3C1E38]">Profile</CardTitle>
                <CardDescription className="text-[#3C1E38]/60">Manage your personal information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user.email || ""} disabled className="bg-[#FDFCF9] border-[#A7C2D7]/20" />
              <p className="text-xs text-[#3C1E38]/50">Your email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" type="text" placeholder="How should we greet you?" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="border-[#A7C2D7]/30" />
            </div>
          </CardContent>
        </Card>

        {/* 2. DOMINION Rhythm */}
        <Card id="dominion-rhythm" className="border-[#A7C2D7]/20 bg-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F9D57E]/20">
                <Settings className="h-5 w-5 text-[#3C1E38]" />
              </div>
              <div>
                <CardTitle className="font-playfair text-[#3C1E38]">DOMINION Rhythm</CardTitle>
                <CardDescription className="text-[#3C1E38]/60">When do you start your covenant declarations?</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Select value={sacredRhythm} onValueChange={setSacredRhythm}>
              <SelectTrigger className="border-[#A7C2D7]/30">
                <SelectValue placeholder="Select your DOMINION rhythm" />
              </SelectTrigger>
              <SelectContent>
                {DOMINION_RHYTHMS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* 3. Primary Focus Area */}
        <Card id="primary-focus" className="border-[#A7C2D7]/20 bg-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                <Bell className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="font-playfair text-[#3C1E38]">Primary Focus Area</CardTitle>
                <CardDescription className="text-[#3C1E38]/60">Where is God calling you to dominion?</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Select value={spiritualSeason} onValueChange={setSpiritualSeason}>
              <SelectTrigger className="border-[#A7C2D7]/30">
                <SelectValue placeholder="Select your primary focus" />
              </SelectTrigger>
              <SelectContent>
                {FOCUS_AREAS.map((a) => (
                  <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Save Profile/Rhythm/Focus */}
        <div className="flex justify-end">
          <Button onClick={handleSaveProfile} disabled={saving} className="bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38] min-w-32">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : saved ? <Check className="mr-2 h-4 w-4" /> : null}
            Save Changes
          </Button>
        </div>

        {/* 4a. Personal year (DOMINION) */}
        <PersonalYearConfig userId={user.id} initialRows={personalYears} onRowsChange={() => router.refresh()} />

        {/* 4b. System calendar quarters */}
        <QuarterConfig userId={user.id} quarters={quarters} onQuartersChange={() => router.refresh()} />

        {/* 5. Intercession Schedule */}
        <IntercessionEditor userId={user.id} initialSchedule={intercessionSchedule} onSave={() => router.refresh()} />

        {/* 6. Goal Configuration */}
        <GoalEditor userId={user.id} initialGoals={goals} onSave={() => router.refresh()} />

        {/* 7. Notifications */}
        <NotificationsSection userId={user.id} initialPrefs={notificationPrefs} onSave={() => router.refresh()} />

        {/* 8. Data Management */}
        <DataManagement
          userId={user.id}
          storageCounts={storageCounts}
          quarterStartStr={quarterStartStr}
          quarterEndStr={quarterEndStr}
          quarterCode={quarterCode}
          onExport={() => router.refresh()}
          onImport={() => router.refresh()}
          onReset={() => router.refresh()}
        />

        {/* 9. Account */}
        <Card id="account" className="border-[#A7C2D7]/20 border-destructive/20 bg-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <Shield className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <CardTitle className="font-playfair text-[#3C1E38]">Account</CardTitle>
                <CardDescription className="text-[#3C1E38]/60">Manage your account settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-[#A7C2D7]/20 p-4">
              <div>
                <p className="font-medium text-[#3C1E38]">Change password</p>
                <p className="text-sm text-[#3C1E38]/60">Set a new password for your account</p>
              </div>
              <Button variant="outline" asChild className="border-[#A7C2D7]/30">
                <Link href="/app/update-password" className="inline-flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Change password
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[#A7C2D7]/20 p-4">
              <div>
                <p className="font-medium text-[#3C1E38]">Sign Out</p>
                <p className="text-sm text-[#3C1E38]/60">Sign out of your account on this device</p>
              </div>
              <Button variant="outline" onClick={handleSignOut} disabled={signingOut} className="border-[#A7C2D7]/30">
                {signingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                Sign Out
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-destructive/20 p-4">
              <div>
                <p className="font-medium text-destructive">Delete Account</p>
                <p className="text-sm text-[#3C1E38]/60">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive" disabled>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
