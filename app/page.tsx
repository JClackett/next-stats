import { StatsDisplay } from "@/components/stats-display"
import { Button } from "@/components/ui/button"
// import { StatsDisplay } from "@/components/stats-display"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { analyzeRepo } from "@/lib/analyze-repo"
import { Metadata } from "next"
import Form from "next/form"
import { Suspense } from "react"
import { RepoForm } from "./repo-form"

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ repo?: string }>
}): Promise<Metadata> {
  const repoUrl = (await searchParams).repo

  if (!repoUrl) {
    return {
      title: "Next Stats",
      description: "Analyze Next.js repositories for pages, components, API routes, and more.",
    }
  }

  const result = await analyzeRepo(repoUrl)
  const title = result.data ? `Analysis of ${result.data.owner}/${result.data.repo}` : "Next Stats"

  return {
    title,
    description: `View the Next.js structure analysis for ${repoUrl}`,
    openGraph: {
      title,
      description: `View the Next.js structure analysis for ${repoUrl}`,
      images: [`/og?repo=${encodeURIComponent(repoUrl)}`],
    },
    twitter: {
      card: "summary_large_image",
    },
  }
}

export default function Page({ searchParams }: { searchParams: Promise<{ repo?: string }> }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <main className="container mx-auto max-w-3xl flex-12 px-4 py-24">
        <Card>
          <CardHeader>
            <CardTitle>Analyze Next.js Repository</CardTitle>
            <CardDescription className="font-mono">Enter a GitHub repository URL to analyze its Next.js stats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Suspense
              fallback={
                <Form action="/" className="flex gap-2">
                  <Input
                    name="repo"
                    type="url"
                    autoComplete="organization"
                    autoCorrect="off"
                    placeholder="https://github.com/username/repo"
                    defaultValue=""
                    required
                    pattern="https://github\.com/[\w-]+/[\w\.-]+"
                    className="flex-1"
                  />
                  <Button type="submit">Analyze</Button>
                </Form>
              }
            >
              <RepoForm />
            </Suspense>

            <Suspense fallback={<div>Loading...</div>}>
              <RepoStats searchParams={searchParams} />
            </Suspense>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

async function RepoStats({ searchParams }: { searchParams: Promise<{ repo?: string }> }) {
  const repoUrl = (await searchParams).repo
  if (!repoUrl) return null
  const result = await analyzeRepo(repoUrl)

  if (result.error) {
    return <div className="rounded-lg bg-destructive/15 px-4 py-2 text-destructive text-sm">{result.error}</div>
  }

  if (!result.data) return null

  return <StatsDisplay stats={result.data} />
}
