"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2Icon } from "lucide-react"
import Form from "next/form"
import { useSearchParams } from "next/navigation"
import { useFormStatus } from "react-dom"

export function RepoForm() {
  const searchParams = useSearchParams()
  const repo = searchParams.get("repo")

  return (
    <Form action="/" className="flex gap-2">
      <Input
        name="repo"
        type="url"
        autoComplete="organization"
        autoCorrect="off"
        placeholder="https://github.com/username/repo"
        defaultValue={repo || ""}
        required
        pattern="https://github\.com/[\w-]+/[\w\.-]+"
        className="flex-1"
      />
      <SubmitButton />
    </Form>
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
