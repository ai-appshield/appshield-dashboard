import { Octokit } from '@octokit/rest'

export interface ScanResult {
  repoFullName: string
  scannedAt: string
  score: number
  files: {
    name: string
    present: boolean
    fresh: boolean
    complete: boolean
  }[]
  summary: {
    total: number
    present: number
    missing: string[]
  }
}

const REQUIRED_FILES = [
  'README.md',
  'SECURITY.md',
  'CONTRIBUTING.md',
  '.github/CODEOWNERS',
  '.github/dependabot.yml',
  'LICENSE',
  '.github/workflows/ci.yml',
]

export async function scanRepository(
  repoFullName: string,
  githubToken?: string
): Promise<ScanResult> {
  const [owner, repo] = repoFullName.split('/')
  const octokit = new Octokit({ auth: githubToken })

  const fileResults = await Promise.all(
    REQUIRED_FILES.map(async (filePath) => {
      try {
        const { data } = await octokit.repos.getContent({ owner, repo, path: filePath })
        const file = Array.isArray(data) ? null : data
        const present = !!file
        // Check freshness: updated within last 180 days
        let fresh = false
        if (present) {
          const commits = await octokit.repos.listCommits({
            owner,
            repo,
            path: filePath,
            per_page: 1,
          })
          if (commits.data.length > 0) {
            const lastCommitDate = new Date(
              commits.data[0].commit.committer?.date ?? commits.data[0].commit.author?.date ?? ''
            )
            const daysSince = (Date.now() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24)
            fresh = daysSince < 180
          }
        }
        // Completeness: file size > 100 bytes = has real content
        const complete = present && (file as { size?: number })?.size !== undefined && ((file as { size: number }).size > 100)
        return { name: filePath, present, fresh, complete }
      } catch {
        return { name: filePath, present: false, fresh: false, complete: false }
      }
    })
  )

  const presentFiles = fileResults.filter((f) => f.present)
  const missingFiles = fileResults.filter((f) => !f.present).map((f) => f.name)

  // Score: presence 50% + completeness 30% + freshness 20%
  const presenceScore = (presentFiles.length / REQUIRED_FILES.length) * 50
  const completenessScore = (fileResults.filter((f) => f.complete).length / REQUIRED_FILES.length) * 30
  const freshnessScore = (fileResults.filter((f) => f.fresh).length / REQUIRED_FILES.length) * 20
  const score = Math.round(presenceScore + completenessScore + freshnessScore)

  return {
    repoFullName,
    scannedAt: new Date().toISOString(),
    score,
    files: fileResults,
    summary: {
      total: REQUIRED_FILES.length,
      present: presentFiles.length,
      missing: missingFiles,
    },
  }
}
