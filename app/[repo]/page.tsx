import { StatsDisplay } from "@/components/stats-display"
import { RepoData, analyzeRepo, getRepoKey } from "@/lib/analyze-repo"
import { redis } from "@/lib/upstash"
import { Metadata } from "next"

const standardMetadata: Metadata = {
  title: "Rate My Next",
  description: "Rate your Next.js repository.",
  openGraph: {
    title: "Rate My Next App",
    description: "Rate your Next.js repository.",
    images: ["https://rate-my-next.vercel.app/cover.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://rate-my-next.vercel.app/cover.png"],
  },
}

export async function generateMetadata({ params }: { params: Promise<{ repo?: string }> }): Promise<Metadata> {
  const repoUrl = (await params).repo

  if (!repoUrl) return standardMetadata

  const decodedRepoUrl = decodeURIComponent(repoUrl)

  const key = getRepoKey(decodedRepoUrl)

  let result: RepoData | null = null
  if (key) {
    const cachedResult = await redis.hgetall<RepoData>(key)
    if (cachedResult?.info.updatedAt && cachedResult.info.updatedAt > Date.now() - 1000 * 60 * 60) {
      result = cachedResult
    } else {
      const res = await analyzeRepo(decodedRepoUrl)
      if (!res.success) return standardMetadata
      result = res.data
    }
  } else {
    const res = await analyzeRepo(decodedRepoUrl)
    if (!res.success) return standardMetadata
    result = res.data
  }
  const title = result ? `Stats for ${result.info.owner}/${result.info.repo}` : "Rate My Next"
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
  const decodedRepoUrl = decodeURIComponent(repoUrl)

  const key = getRepoKey(decodedRepoUrl)
  if (!key) return <div className="rounded-lg bg-destructive px-6 py-4 text-sm text-white shadow-main">Invalid Repo URL</div>

  const cachedResult = await redis.hgetall<RepoData>(key)
  if (cachedResult?.info.updatedAt && cachedResult.info.updatedAt > Date.now() - 1000 * 60 * 60) {
    return <StatsDisplay data={cachedResult} />
  }

  const result = await analyzeRepo(decodedRepoUrl)

  if (!result.success) {
    return <div className="rounded-lg bg-destructive px-6 py-4 text-sm text-white shadow-main">{result.error}</div>
  }
  return <StatsDisplay data={result.data} />
}
