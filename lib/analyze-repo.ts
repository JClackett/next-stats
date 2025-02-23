import { Octokit } from "@octokit/rest"
import { unstable_cache } from "next/cache"
import { cache } from "react"

export interface RepoStats {
  owner: string
  repo: string
  pages: number
  components: number
  apiRoutes: number
  totalFiles: number
  isTurbo: boolean
  isTailwind: boolean
  isPPR: boolean
  score: number
}

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

export const analyzeRepo = cache(
  unstable_cache(
    async (url: string): Promise<{ error?: string; data?: RepoStats }> => {
      // "use cache"
      // unstable_cacheLife("hours")
      try {
        // Extract owner and repo from GitHub URL
        const match = url.match(/github\.com\/([^/]+)\/([^/]+)/)
        if (!match) return { error: "Invalid GitHub URL" }
        const [, owner, repo] = match

        // Get repository contents recursively
        const repoInfo = await octokit.rest.repos.get({ owner, repo })

        const response = await octokit.rest.git.getTree({
          owner,
          repo,
          tree_sha: repoInfo.data.default_branch,
          recursive: "1",
        })

        if (response.status !== 200) {
          return { error: "Failed to fetch repository contents" }
        }

        const files = response.data.tree

        const nextConfigs = files.filter(
          (file) =>
            file.path?.endsWith("next.config.js") ||
            file.path?.endsWith("next.config.ts") ||
            file.path?.endsWith("next.config.mjs") ||
            file.path?.endsWith("next.config.mts"),
        )

        if (nextConfigs.length === 0) {
          return { error: "Not a Next.js repository" }
        }
        if (nextConfigs.length > 1) {
          return { error: "Multiple next.config.ts files found" }
        }

        const nextConfig = nextConfigs[0]

        if (!nextConfig.path) {
          return { error: "Invalid next.config.ts file" }
        }
        // filter files that are not in the same directory as next.config.ts
        const nextDirectory = nextConfig.path.split("/").slice(0, -1).join("/")

        // Count different types of files
        let pages = 0
        let components = 0
        let apiRoutes = 0
        let totalFiles = 0
        let isTurbo = false
        let isPPR = false
        let isTailwind = false

        files
          .filter((file) => file.path?.startsWith(nextDirectory))
          .forEach((file) => {
            if (!file.path) return

            if (file.type === "blob") {
              totalFiles++
              if (file.path.match(/app\/(.+\/)?page.tsx$/)) {
                pages++
              } else if (file.path.match(/.*\.(tsx)$/)) {
                components++
              } else if (file.path.match(/.*route\.(ts|tsx)$/)) {
                apiRoutes++
              }
            }
          })
        const [packageJson, nextConfigContent] = await Promise.all([
          getPackageJson(owner, repo, nextDirectory, repoInfo),
          getNextConfig(owner, repo, nextConfig.path, repoInfo),
        ])

        if (packageJson?.includes("tailwindcss")) {
          isTailwind = true
        }
        if (packageJson?.includes("next dev --turbo") || packageJson?.includes("next dev --turbopack")) {
          isTurbo = true
        }
        if (nextConfigContent?.includes("ppr")) {
          isPPR = true
        }

        const score = calculateScore(pages, components, apiRoutes, totalFiles, isTurbo, isTailwind, isPPR)
        return { data: { owner, repo, pages, components, apiRoutes, totalFiles, isTurbo, isTailwind, isPPR, score } }
      } catch (error: any) {
        console.log(error)
        if (error.status === 404) {
          return { error: "Repository not found" }
        }
        if (error.status === 403) {
          return { error: "Rate limit exceeded or repository is private" }
        }
        return { error: "Failed to analyze repository" }
      }
    },
    ["repo"],
    { revalidate: 60 },
  ),
)

function calculateScore(
  pages: number,
  components: number,
  apiRoutes: number,
  totalFiles: number,
  isTurbo: boolean,
  isTailwind: boolean,
  isPPR: boolean,
) {
  let score = 0
  if (isTurbo) {
    score += 100
  }
  if (isTailwind) {
    score += 100
  }
  if (isPPR) {
    score += 100
  }
  score += pages * 100
  score += components * 20
  score += apiRoutes * 100
  score += totalFiles

  return score
}

async function getPackageJson(owner: string, repo: string, nextDirectory: string, repoInfo: any) {
  const pkgResponse = await octokit.rest.repos.getContent({
    owner,
    repo,
    path: `${nextDirectory}/package.json`,
    ref: repoInfo.data.default_branch,
  })
  if (pkgResponse.status === 200) {
    // @ts-ignore
    const content = Buffer.from(pkgResponse.data.content || "", "base64").toString("utf-8")
    return content
  }
  return null
}

async function getNextConfig(owner: string, repo: string, nextConfigPath: string, repoInfo: any) {
  const nextResponse = await octokit.rest.repos.getContent({
    owner,
    repo,
    path: nextConfigPath,
    ref: repoInfo.data.default_branch,
  })
  if (nextResponse.status === 200) {
    // @ts-ignore
    const content = Buffer.from(nextResponse.data.content || "", "base64").toString("utf-8")
    return content
  }
  return null
}
