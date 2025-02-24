import { Octokit } from "@octokit/rest"
import { unstable_cache } from "next/cache"
import { cache } from "react"
import { redis } from "./upstash"

export type RepoStats = {
  pages: number
  components: number
  apiRoutes: number
  totalFiles: number
  isTurbo: boolean
  isTailwind: boolean
  isPPR: boolean
  score: number
}

export type RepoInfo = {
  url: string
  owner: string
  repo: string
  subPath?: string
  updatedAt: number
}

export type RepoData = {
  stats: RepoStats
  info: RepoInfo
}

type RepoError = {
  error: string
  success: false
  data: null
}

type RepoSuccess = {
  error: null
  success: true
  data: RepoData
}

export type RepoResult = RepoError | RepoSuccess

const nextConfigOptions = ["next.config.ts", "next.config.mts", "next.config.mjs", "next.config.js"]

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

export function getRepoKey(url: string) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)(?:\/tree\/[^/]+)?(?:\/(.+))?/)
  if (!match) return null
  const [, owner, repo, subPath] = match
  return `repo:${owner}:${repo}${subPath ? `:${subPath}` : ""}`.replace(/\//g, "-").toLowerCase()
}

export const analyzeRepo = cache(
  unstable_cache(
    async (url: string): Promise<RepoResult> => {
      try {
        // Extract owner, repo and optional path from GitHub URL
        const match = url.match(/github\.com\/([^/]+)\/([^/]+)(?:\/tree\/[^/]+)?(?:\/(.+))?/)
        if (!match) return { error: "Invalid GitHub URL", success: false, data: null }
        const [, owner, repo, subPath] = match

        // Get repository contents recursively
        const repoInfo = await octokit.rest.repos.get({ owner, repo })

        const response = await octokit.rest.git.getTree({ owner, repo, tree_sha: repoInfo.data.default_branch, recursive: "1" })

        if (response.status !== 200) {
          return { error: "Failed to fetch repository contents", success: false, data: null }
        }

        const files = response.data.tree

        // If subPath provided, only look for next.config in that directory
        const nextConfigs = files
          .filter((f) => (subPath ? f.path?.startsWith(subPath) : true))
          .filter((file) => {
            if (!file.path) return false

            // if file path is exactly one of the nextConfigOptions, return true
            if (nextConfigOptions.includes(file.path)) return true
            // if it ends with "/" + nextConfigOptions, return true
            return nextConfigOptions.some((config) => file.path!.endsWith(`/${config}`))
          })

        if (nextConfigs.length === 0) {
          return { error: "Not a Next.js repository", success: false, data: null }
        }
        if (nextConfigs.length > 1) {
          return {
            error: "Multiple next.config.ts files found, paste the path to the root of a Next.js app",
            success: false,
            data: null,
          }
        }

        const nextConfig = nextConfigs[0]

        if (!nextConfig.path) {
          return { error: "Invalid next.config.ts file", success: false, data: null }
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
              if (file.path.match(/(.+\/)?page.tsx$/)) {
                pages++
              } else if (file.path.match(/(?:src\/)?pages\/.*\.tsx$/)) {
                pages++
              } else if (file.path.match(/.*route\.(ts|tsx)$/)) {
                apiRoutes++
              } else if (file.path.match(/.*\.(tsx)$/)) {
                components++
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
        const stats = { owner, repo, subPath, pages, components, apiRoutes, totalFiles, isTurbo, isTailwind, isPPR, score }

        const key = getRepoKey(url)!

        const data = { stats, info: { url, owner, repo, subPath, updatedAt: Date.now() } }

        await redis.zadd("leaderboard", { member: key, score: data.stats.score })
        await redis.hset(key, data)

        return { data, error: null, success: true }
      } catch (error: any) {
        console.log(error)
        let message = "Failed to analyze repository"
        if (error.status === 404) message = "Repository not found"
        if (error.status === 403) message = "Rate limit exceeded or repository is private"

        return { error: message, success: false, data: null }
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
  if (isTurbo) score += 100
  if (isTailwind) score += 100
  if (isPPR) score += 100
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
