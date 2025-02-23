import { StatsDisplay } from "@/components/stats-display"
import { analyzeRepo } from "@/lib/analyze-repo"
import { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ repo?: string }> }): Promise<Metadata> {
  const repoUrl = (await params).repo

  if (!repoUrl) {
    return {
      title: "Rate My Next",
      description: "Rate your Next.js repository.",
    }
  }

  const decodedRepoUrl = decodeURIComponent(repoUrl)
  const result = await analyzeRepo(decodedRepoUrl)
  const title = result.data ? `Stats for ${result.data.owner}/${result.data.repo}` : "Rate My Next"

  return {
    title,
    description: `View the Next.js stats for ${decodedRepoUrl}`,
    openGraph: {
      title,
      description: `View the Next.js stats for ${decodedRepoUrl}`,
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
