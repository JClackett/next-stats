"use server"

import { Octokit } from "@octokit/rest"

export async function analyzeRepo(url: string, userToken?: string) {
  try {
    // Extract owner and repo from GitHub URL
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (!match) {
      return { error: "Invalid GitHub URL" }
    }

    const [, owner, repo] = match

    // Initialize Octokit with user token if provided, otherwise try without auth for public repos
    const octokit = new Octokit({
      auth: userToken || undefined,
    })

    // Try to get the default branch first
    let defaultBranch = "main"
    try {
      const repoInfo = await octokit.rest.repos.get({
        owner,
        repo,
      })
      defaultBranch = repoInfo.data.default_branch
    } catch (error) {
      if (error.status === 404) {
        return { error: "Repository not found" }
      }
      if (error.status === 401) {
        return { error: "Invalid GitHub token" }
      }
      if (error.status === 403) {
        return { error: "Repository is private. Please provide a GitHub token" }
      }
      throw error
    }

    // Get repository contents recursively
    const response = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: defaultBranch,
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

        // Count pages
        if (file.path.match(/app\/(.+\/)?page\.(js|jsx|ts|tsx)$/)) {
          pages++
        }
        // Count components
        else if (file.path.match(/components\/.*\.(js|jsx|ts|tsx)$/)) {
          components++
        }
        // Count API routes
        else if (file.path.match(/app\/api\/.*route\.(js|jsx|ts|tsx)$/)) {
          apiRoutes++
        }
      }
    })

    return {
      pages,
      components,
      apiRoutes,
      totalFiles,
    }
  } catch (error) {
    console.error("Error analyzing repo:", error)
    return { error: "Failed to analyze repository" }
  }
}

