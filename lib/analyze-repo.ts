import { Octokit } from "@octokit/rest"
import { cache } from "react"

export interface RepoStats {
  owner: string
  repo: string
  pages: number
  components: number
  apiRoutes: number
  totalFiles: number
}

export const analyzeRepo = cache(async (url: string): Promise<{ error?: string; data?: RepoStats }> => {
  // "use cache"
  // unstable_cacheLife("hours")
  try {
    // Extract owner and repo from GitHub URL
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (!match) {
      return { error: "Invalid GitHub URL" }
    }

    const [, owner, repo] = match

    // Initialize Octokit without auth for public repos
    const octokit = new Octokit()

    // Get repository contents recursively
    const repoInfo = await octokit.rest.repos.get({
      owner,
      repo,
    })

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

    // Count different types of files
    let pages = 0
    let components = 0
    let apiRoutes = 0
    let totalFiles = 0

    files.forEach((file) => {
      if (!file.path) return

      if (file.type === "blob") {
        totalFiles++

        if (file.path.match(/app\/(.+\/)?page\.(js|jsx|ts|tsx)$/)) {
          pages++
        } else if (file.path.match(/components\/.*\.(js|jsx|ts|tsx)$/)) {
          components++
        } else if (file.path.match(/app\/api\/.*route\.(js|jsx|ts|tsx)$/)) {
          apiRoutes++
        }
      }
    })

    return {
      data: {
        owner,
        repo,
        pages,
        components,
        apiRoutes,
        totalFiles,
      },
    }
  } catch (error: any) {
    if (error.status === 404) {
      return { error: "Repository not found" }
    }
    if (error.status === 403) {
      return { error: "Rate limit exceeded or repository is private" }
    }
    return { error: "Failed to analyze repository" }
  }
})
