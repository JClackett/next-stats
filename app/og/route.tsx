import { RepoData, analyzeRepo, getRepoKey } from "@/lib/analyze-repo"
import { redis } from "@/lib/upstash"
import { ImageResponse } from "next/og"

export const runtime = "edge"

const standardResponse = new ImageResponse(
  <div tw="h-full w-full flex items-center justify-center bg-[#FDF8F7] p-10">
    <div tw="flex flex-col items-center justify-center p-32 border bg-white border-[#E8927C]">
      <h1 tw="text-7xl font-bold text-center">Rate My Next App</h1>
    </div>
  </div>,
  { width: 1200, height: 630 },
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const repoUrl = searchParams.get("repo")

    if (!repoUrl) return standardResponse
    const decodedRepoUrl = decodeURIComponent(repoUrl)

    const key = getRepoKey(decodedRepoUrl)
    if (!key) return standardResponse

    const cachedResult = await redis.hgetall<RepoData>(key)
    let data: RepoData
    if (cachedResult) {
      data = cachedResult
    } else {
      const result = await analyzeRepo(decodedRepoUrl)
      if (!result.success) return standardResponse
      data = result.data
    }

    const { pages, components, apiRoutes, totalFiles, isPPR, isTailwind, isTurbo, score } = data.stats
    const { owner, repo } = data.info
    const stats = [
      {
        title: "Pages",
        value: pages,
        // icon: <LayoutGrid />
      },
      {
        title: "Components",
        value: components,
        // icon: <Puzzle />
      },
      {
        title: "API Routes",
        value: apiRoutes,
        // icon: <Network />
      },
      {
        title: "Total Files",
        value: totalFiles,
        // icon: <Files />
      },
    ]

    return new ImageResponse(
      <div tw="h-full w-full flex flex-col items-center justify-center bg-[#FDF8F7] p-10">
        <div tw="flex flex-col w-full max-w-[900px]">
          {/* Header */}
          <div tw="flex flex-row items-start justify-between w-full">
            <div tw="flex flex-col mb-10">
              <h1 tw="text-5xl font-bold m-0 mb-2">{repo}</h1>
              <p tw="text-2xl text-[#886F59] m-0">{owner}</p>
            </div>
            <div tw="flex items-center flex-row">
              <div tw="flex text-2xl text-[#886F59]">Score</div>
              <div tw="flex text-5xl font-bold ml-2">{score}</div>
            </div>
          </div>

          {/* Tags */}
          <div tw="flex pl-2">
            {isTurbo && <div tw="flex mr-2 bg-[#023293] text-white px-2 py-1">Turbopack</div>}
            {isTailwind && <div tw="flex mr-2 bg-[#023293] text-white px-2 py-1">Tailwind</div>}
            {isPPR && <div tw="flex mr-2 bg-[#023293] text-white px-2 py-1">PPR</div>}
          </div>

          {/* Grid */}
          <div tw="flex flex-wrap w-full justify-center">
            {/* 3px 3px 0 -1px */}
            {stats.map((stat) => (
              <div key={stat.title} tw="flex p-2 w-1/2">
                <div tw="flex mb-2 flex-col bg-white p-6 border border-[#E8927C] w-full">
                  <div tw="flex justify-between items-center mb-4">
                    <div tw="flex text-2xl">{stat.title}</div>
                    {/* <LayoutGrid style={{ width: "20px", height: "20px", color: "#666666" }} /> */}
                  </div>
                  <div tw="flex text-5xl font-bold">{stat.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (error) {
    console.error("Error generating OG image:", error)
    return new Response("Failed to generate image", { status: 500 })
  }
}
