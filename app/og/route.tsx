import { analyzeRepo } from "@/lib/analyze-repo"
import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const repoUrl = searchParams.get("repo")

    if (!repoUrl) {
      return new Response("Missing repo parameter", { status: 400 })
    }
    const decodedRepoUrl = decodeURIComponent(repoUrl)

    const result = await analyzeRepo(decodedRepoUrl)

    if (result.error || !result.data) {
      throw new Error(result.error || "Failed to analyze repository")
    }

    const { owner, repo, pages, components, apiRoutes, totalFiles, isPPR, isTailwind, isTurbo } = result.data

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
          <div tw="flex flex-col mb-10">
            <h1 tw="text-5xl font-bold m-0 mb-2">{repo}</h1>
            <p tw="text-2xl text-[#666666] m-0">{owner}</p>
          </div>

          {/* Tags */}
          <div tw="flex gap-2 pl-2">
            {isTurbo && <div tw="flex mr-2 bg-[#E76E50] text-white px-2 py-1">Turbopack</div>}
            {isTailwind && <div tw="flex mr-2 bg-[#E76E50] text-white px-2 py-1">Tailwind</div>}
            {isPPR && <div tw="flex mr-2 bg-[#E76E50] text-white px-2 py-1">PPR</div>}
          </div>

          {/* Grid */}
          <div tw="flex flex-wrap gap-6 w-full justify-center">
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
