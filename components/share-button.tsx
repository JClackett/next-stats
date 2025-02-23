"use client"

import { ShareIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "./ui/button"

export function ShareButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 gap-1 px-2 text-xs"
      onClick={() => {
        try {
          navigator.clipboard.writeText(window.location.href)
          toast.success("Copied to clipboard")
        } catch (error) {
          console.error(error)
        }
      }}
    >
      <span className="font-mono">Share</span>
      <ShareIcon className="!size-3" />
    </Button>
  )
}
