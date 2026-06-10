import { Octokit } from '@octokit/rest'

const APPSHIELD_DOCS = [
  'conventions.md',
  'locked-patterns.md',
  'knowledge-base.md',
  'session-handoff.md',
  'update-process.md',
  'decision-log.md',
  'agent-workflow.md',
]

export async function fetchDocFiles(repoFullName: string, token?: string) {
  const octokit = new Octokit({ auth: token || process.env.GITHUB_PAT })
  const [owner, repo] = repoFullName.split('/')

  const results: Record<string, { content: string | null; lastCommitDate: string | null }> = {}

  for (const docName of APPSHIELD_DOCS) {
    try {
      // Get file content
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: `docs/${docName}`,
      })

      const content = 'content' in data
        ? Buffer.from(data.content, 'base64').toString('utf-8')
        : null

      // Get last commit date for this file
      const commits = await octokit.repos.listCommits({
        owner,
        repo,
        path: `docs/${docName}`,
        per_page: 1,
      })

      const lastCommitDate = commits.data[0]?.commit?.committer?.date || null

      results[docName] = { content, lastCommitDate }
    } catch {
      // File doesn't exist
      results[docName] = { content: null, lastCommitDate: null }
    }
  }

  return results
}
