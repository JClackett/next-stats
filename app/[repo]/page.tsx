import { StatsDisplay } from "@/components/stats-display"
import { analyzeRepo } from "@/lib/analyze-repo"
import { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ repo?: string }> }): Promise<Metadata> {
  const repoUrl = (await params).repo

  if (!repoUrl) {
    return {
      title: "Next Stats",
      description: "Analyze Next.js repositories for pages, components, API routes, and more.",
    }
  }

  const decodedRepoUrl = decodeURIComponent(repoUrl)
  const result = await analyzeRepo(decodedRepoUrl)
  const title = result.data ? `Analysis of ${result.data.owner}/${result.data.repo}` : "Next Stats"

  return {
    title,
    description: `View the Next.js structure analysis for ${decodedRepoUrl}`,
    openGraph: {
      title,
      description: `View the Next.js structure analysis for ${decodedRepoUrl}`,
      images: [`/og?repo=${repoUrl}`],
    },
    twitter: {
      card: "summary_large_image",
    },
  }
}

export default async function Page({ params }: { params: Promise<{ repo?: string }> }) {
  const repoUrl = (await params).repo
  if (!repoUrl) return null

  const result = await analyzeRepo(decodeURIComponent(repoUrl))

  if (result.error) {
    return <div className="rounded-lg bg-destructive px-6 py-4 text-sm text-white shadow-main">{result.error}</div>
  }

  if (!result.data) return null

  return <StatsDisplay stats={result.data} />
}
