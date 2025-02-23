import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RepoForm } from "@/components/repo-form"
import { StatsDisplay } from "@/components/stats-display"
import { analyzeRepo } from "@/lib/analyze-repo"

export async function generateMetadata({ searchParams }): Promise<Metadata> {
  const repoUrl = searchParams.repo

  if (!repoUrl) {
    return {
      title: "GitHub Next.js Analyzer",
      description: "Analyze Next.js repositories for pages, components, API routes, and more.",
    }
  }

  const result = await analyzeRepo(repoUrl)
  const title = result.data ? `Analysis of ${result.data.owner}/${result.data.repo}` : "GitHub Next.js Analyzer"

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

export default async function Home({ searchParams }: { searchParams: { repo?: string } }) {
  const repoUrl = searchParams.repo
  const result = repoUrl ? await analyzeRepo(repoUrl) : null

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col">
      <header className="border-b bg-background h-14 flex items-center px-4 lg:px-6">
        <h1 className="text-lg font-semibold">GitHub Next.js Analyzer</h1>
      </header>
      <main className="flex-1 container max-w-3xl py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Analyze Next.js Repository</CardTitle>
            <CardDescription>Enter a GitHub repository URL to analyze its Next.js structure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RepoForm initialUrl={repoUrl} />

            {result?.error && (
              <div className="rounded-lg bg-destructive/15 text-destructive px-4 py-2 text-sm">{result.error}</div>
            )}

            {result?.data && <StatsDisplay stats={result.data} />}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

