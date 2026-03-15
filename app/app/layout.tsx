import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/app/app-shell"
import { QuickCaptureFab } from "@/components/app/quick-capture-fab"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  return (
    <AppShell
      user={{ id: user.id, email: user.email ?? "", displayName: profile?.display_name ?? user.user_metadata?.display_name ?? "Friend", avatarUrl: profile?.avatar_url }}
    >
      {children}
      <QuickCaptureFab userId={user.id} />
    </AppShell>
  )
}
