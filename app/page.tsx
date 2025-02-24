import type { RepoData } from "@/lib/analyze-repo"
import { redis } from "@/lib/upstash"
import { unstable_cache } from "next/cache"
import Link from "next/link"

export default async function Page() {
  const leaderboard = await getLeaderboard()

  return (
    <div className="flex flex-col gap-2">
      {leaderboard.map((item) => (
        <div key={item.key} className="flex flex-row items-center justify-between gap-2 border px-4 py-2">
          <div>
            <Link href={`/${encodeURIComponent(item.data?.info.url || "")}`} className="font-bold hover:underline">
              {item.data?.info.repo}
            </Link>
            <p className="text-muted-foreground text-xs">{item.data?.info.owner}</p>
          </div>
          <p className="font-bold">{item.score.toLocaleString()}</p>
        </div>
      ))}
    </div>
  )
}

const getLeaderboard = unstable_cache(
  async () => {
    const leaderboard = await redis.zrange("leaderboard", 0, -1, { withScores: true, rev: true })

    const leaderboardArray = []
    for (let i = 0; i < leaderboard.length; i += 2) {
      const member = leaderboard[i] as string
      const score = leaderboard[i + 1] as string
      // Push an object with member and score into the array
      leaderboardArray.push({
        key: member,
        score: Number.parseFloat(score), // Convert score to a number
      })
    }

    const leaderBoardWithInfo = await Promise.all(
      leaderboardArray.map(async (item) => {
        const data = await redis.hgetall<RepoData>(item.key)
        return { ...item, data }
      }),
    )
    return leaderBoardWithInfo
  },
  ["leaderboard"],
  { revalidate: 60 },
)
