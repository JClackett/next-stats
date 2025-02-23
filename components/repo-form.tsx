"use client"

import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Analyze
    </Button>
  )
}

export function RepoForm({ initialUrl = "" }: { initialUrl?: string }) {
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    const url = formData.get("url")
    router.push(`/?repo=${encodeURIComponent(url as string)}`)
  }

  return (
    <form action={handleSubmit} className="flex gap-2">
      <Input
        name="url"
        type="url"
        placeholder="https://github.com/username/repo"
        defaultValue={initialUrl}
        required
        pattern="https://github\.com/[\w-]+/[\w-]+"
        className="flex-1"
      />
      <SubmitButton />
    </form>
  )
}

