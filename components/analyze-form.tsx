"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { analyzeRepo } from "@/app/actions"
import { StatsDisplay } from "./stats-display"

interface AnalyzeFormProps {
  initialUrl?: string
}

export function AnalyzeForm({ initialUrl = "" }: AnalyzeFormProps) {
  const [url, setUrl] = useState(initialUrl)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [stats, setStats] = useState<any>(null)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setStats(null)

    try {
      // Update URL with repo parameter
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.set("repo", url)
      router.push(newUrl.toString())

      const result = await analyzeRepo(url)
      if (result.error) {
        setError(result.error)
      } else {
        setStats(result)
      }
    } catch (err) {
      setError("Failed to analyze repository")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          type="url"
          placeholder="https://github.com/username/repo"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          pattern="https://github\.com/[\w-]+/[\w-]+"
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Analyze
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {stats && <StatsDisplay stats={stats} />}
    </div>
  )
}

