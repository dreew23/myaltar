"use client"

import { useState, useEffect } from "react"
import { Bell, Flame, ScrollText, CalendarCheck, Target, Heart } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { SectionCard } from "./section-card"

export interface NotificationPrefs {
  prayer_reminder: { enabled: boolean; time: string }
  declaration_reminder: { enabled: boolean; time: string }
  sunday_pulse_reminder: { enabled: boolean; time: string }
  sub_challenge_reminder: { enabled: boolean; time: string }
  gratitude_reminder: { enabled: boolean; time: string }
}

const DEFAULT_PREFS: NotificationPrefs = {
  prayer_reminder: { enabled: false, time: "02:50" },
  declaration_reminder: { enabled: false, time: "05:30" },
  sunday_pulse_reminder: { enabled: false, time: "14:00" },
  sub_challenge_reminder: { enabled: false, time: "20:00" },
  gratitude_reminder: { enabled: false, time: "21:00" },
}

const ITEMS: { key: keyof NotificationPrefs; icon: typeof Flame; title: string; description: string }[] = [
  { key: "prayer_reminder", icon: Flame, title: "Prayer Session Reminder", description: "Gentle nudge before your prayer time" },
  { key: "declaration_reminder", icon: ScrollText, title: "Declaration Reminder", description: "Reminder to recite your declarations" },
  { key: "sunday_pulse_reminder", icon: CalendarCheck, title: "Sunday Planning Session", description: "Start your weekly review and planning" },
  { key: "sub_challenge_reminder", icon: Target, title: "Active Challenge Reminders", description: "Reminders for ongoing spiritual challenges" },
  { key: "gratitude_reminder", icon: Heart, title: "Gratitude Reminder", description: "Evening reminder to capture 3 gratitudes" },
]

interface NotificationsSectionProps {
  userId: string
  initialPrefs: NotificationPrefs | null
  onSave?: () => void
}

export function NotificationsSection({ userId, initialPrefs, onSave }: NotificationsSectionProps) {
  const [prefs, setPrefs] = useState<NotificationPrefs>(() => initialPrefs ?? DEFAULT_PREFS)
  const [saving, setSaving] = useState(false)
  const [isPwa, setIsPwa] = useState(false)

  useEffect(() => {
    setIsPwa(typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches)
  }, [])

  const update = (key: keyof NotificationPrefs, patch: Partial<NotificationPrefs[keyof NotificationPrefs]>) => {
    setPrefs((p) => ({ ...p, [key]: { ...p[key], ...patch } }))
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = (await import("@/lib/supabase/client")).createClient()
    const { error } = await supabase.from("profiles").update({ notification_preferences: prefs }).eq("id", userId)
    setSaving(false)
    if (error) {
      toast.error("Could not save preferences — " + error.message)
      return
    }
    toast.success("Notification preferences saved")
    onSave?.()
  }

  return (
    <SectionCard
      id="notifications"
      icon={Bell}
      iconBg="bg-amber-500/10"
      iconColor="text-amber-600"
      title="Notifications"
      subtitle="Reminders for your spiritual rhythm"
    >
      <div className="space-y-4">
        {!isPwa && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Notifications require the app to be installed as a PWA. If you haven&apos;t installed ALTAR yet, add it to your home screen first.
          </div>
        )}
        {ITEMS.map(({ key, icon: Icon, title, description }) => (
          <div key={key} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#A7C2D7]/20 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#A7C2D7]/10">
                <Icon className="h-4 w-4 text-[#3C1E38]" />
              </div>
              <div>
                <p className="font-medium text-[#3C1E38]">{title}</p>
                <p className="text-sm text-[#3C1E38]/60">{description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="time"
                value={prefs[key].time}
                onChange={(e) => update(key, { time: e.target.value })}
                className="rounded-md border border-[#A7C2D7]/30 px-2 py-1.5 text-sm"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={prefs[key].enabled}
                  onChange={(e) => update(key, { enabled: e.target.checked })}
                  className="rounded border-[#A7C2D7]/30"
                />
                On
              </label>
            </div>
          </div>
        ))}
        <Button onClick={handleSave} disabled={saving} className="bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38]">
          Save preferences
        </Button>
      </div>
    </SectionCard>
  )
}
