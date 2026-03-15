"use client"

import { useState } from "react"
import { Plus, Sparkles, BookOpen } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { QuickCaptureForm } from "@/app/app/downloads/downloads-client"
import { useRouter } from "next/navigation"

interface Props {
  userId: string
}

export function QuickCaptureFab({ userId }: Props) {
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  const openDivineDownload = () => {
    setMenuOpen(false)
    setOpen(true)
  }

  const openLogWisdom = () => {
    setMenuOpen(false)
    router.push("/app/journal?open=log")
  }

  return (
    <>
      {/* FAB with menu */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {menuOpen && (
          <div className="flex flex-col gap-1.5 bg-white rounded-xl border border-[#A7C2D7]/20 shadow-lg p-1.5 min-w-[180px]">
            <button
              onClick={openDivineDownload}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-sm text-[#3C1E38] hover:bg-[#F9D57E]/20 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-[#F9D57E]" />
              Divine Download
            </button>
            <button
              onClick={openLogWisdom}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-sm text-[#3C1E38] hover:bg-[#A7C2D7]/20 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[#A7C2D7]" />
              Log Wisdom
            </button>
          </div>
        )}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F9D57E] to-[#A7C2D7] shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          title="Quick capture"
        >
          <Plus className="w-6 h-6 text-[#3C1E38]" />
        </button>
      </div>

      {/* Divine Download modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-playfair">Quick Capture ✦ Divine Download</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <QuickCaptureForm
              userId={userId}
              onSaved={() => {
                setOpen(false)
                router.refresh()
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
