import { StatsDisplay } from "@/components/stats-display"
import { analyzeRepo } from "@/lib/analyze-repo"
import { Metadata } from "next"

const standardMetadata: Metadata = {
  title: "Rate My Next",
  description: "Rate your Next.js repository and compare it to others based on very meaningful metrics.",
  openGraph: {
    title: "Rate My Next App",
    description: "Rate your Next.js repository and compare it to others based on very meaningful metrics.",
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

  const result = await analyzeRepo(decodedRepoUrl)
  if (!result.success) return standardMetadata

  const title = result.data ? `Stats for ${result.data.info.owner}/${result.data.info.repo}` : "Rate My Next"
  return {
    title,
    description: `View the Next.js stats for ${decodedRepoUrl}`,
    openGraph: {
      title,
      description: `View the Next.js stats for ${decodedRepoUrl}`,
      images: [`https://rate-my-next.vercel.app/og?repo=${repoUrl}`],
    },
    twitter: {
      card: "summary_large_image",
      images: [`https://rate-my-next.vercel.app/og?repo=${repoUrl}`],
    },
  }
}

export default async function Page({ params }: { params: Promise<{ repo?: string }> }) {
  const repoUrl = (await params).repo
  if (!repoUrl) return null
  const decodedRepoUrl = decodeURIComponent(repoUrl)

  const result = await analyzeRepo(decodedRepoUrl)

  if (!result.success) {
    return <div className="rounded-lg bg-destructive px-6 py-4 text-sm text-white shadow-main">{result.error}</div>
  }
  return <StatsDisplay data={result.data} />
}
