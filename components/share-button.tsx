"use client"

import { ShareIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "./ui/button"

export function ShareButton() {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => {
        try {
          navigator.clipboard.writeText(window.location.href)
          toast.success("Copied to clipboard")
        } catch (error) {
          console.error(error)
        }
      }}
    >
      <ShareIcon />
    </Button>
  )
}
