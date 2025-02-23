import { ImageResponse } from "next/og"
import { analyzeRepo } from "@/lib/analyze-repo"

export const runtime = "edge"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const repoUrl = searchParams.get("repo")

    if (!repoUrl) {
      return new Response("Missing repo parameter", { status: 400 })
    }

    const result = await analyzeRepo(repoUrl)

    if (result.error || !result.data) {
      throw new Error(result.error || "Failed to analyze repository")
    }

    const { owner, repo, pages, components, apiRoutes, totalFiles } = result.data

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          padding: "48px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 40,
              fontWeight: 600,
              color: "white",
              textAlign: "center",
            }}
          >
            {owner}/{repo}
          </div>
          <div
            style={{
              display: "flex",
              gap: "24px",
            }}
          >
            {[
              { label: "Pages", value: pages },
              { label: "Components", value: components },
              { label: "API Routes", value: apiRoutes },
              { label: "Total Files", value: totalFiles },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "#27272a",
                  padding: "16px 24px",
                  borderRadius: "8px",
                }}
              >
                <div style={{ color: "#a1a1aa", fontSize: 16 }}>{stat.label}</div>
                <div style={{ color: "white", fontSize: 32, fontWeight: 600 }}>{stat.value}</div>
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

