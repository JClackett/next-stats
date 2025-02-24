import { StatsDisplay } from "@/components/stats-display"
import { RepoData, analyzeRepo, getRepoKey } from "@/lib/analyze-repo"
import { redis } from "@/lib/upstash"
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

  const title = result.data ? `Stats for ${result.data.info.owner}/${result.data.info.repo}` : "Rate My Next"

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

  const key = getRepoKey(decodeURIComponent(repoUrl))
  if (!key) return <div className="rounded-lg bg-destructive px-6 py-4 text-sm text-white shadow-main">Invalid Repo URL</div>

  const cachedResult = await redis.hgetall<RepoData>(key)
  if (cachedResult?.info.updatedAt && cachedResult.info.updatedAt > Date.now() - 1000 * 60 * 60) {
    return <StatsDisplay data={cachedResult} />
  }

  const result = await analyzeRepo(decodeURIComponent(repoUrl))

  if (!result.success) {
    return <div className="rounded-lg bg-destructive px-6 py-4 text-sm text-white shadow-main">{result.error}</div>
  }
  return <StatsDisplay data={result.data} />
}
