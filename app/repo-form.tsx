"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2Icon } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useMemo } from "react"
import { useFormStatus } from "react-dom"

export function RepoForm() {
  const params = useParams<{ repo: string | undefined }>()
  const intialRepo = params.repo
  const router = useRouter()

  const decoded = useMemo(() => {
    return intialRepo ? decodeURIComponent(intialRepo as string) : ""
  }, [intialRepo])
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const repo = formData.get("repo")
        router.push(`/${encodeURIComponent(repo as string)}`)
      }}
    >
      <Input
        key={intialRepo}
        name="repo"
        type="url"
        autoComplete="organization"
        autoCorrect="off"
        placeholder="https://github.com/username/repo or path to Next.js config"
        defaultValue={decoded || ""}
        required
        // pattern="https://github\.com/[\w-]+/[\w\.-]+"
        className="flex-1"
      />
      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-[100px]">
      {pending ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : "Analyze"}
    </Button>
  )
}
