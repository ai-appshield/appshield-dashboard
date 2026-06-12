import { Octokit } from '@octokit/rest'

export interface DocumentResult {
  name: string
  present: boolean
  score: number
  wordCount: number
  placeholderCount: number
  daysSinceUpdate: number | null
  lastCommitDate: string | null
  stalenessLabel: 'fresh' | 'active' | 'stale' | 'critical' | 'missing'
}

export interface ScanResult {
  repoFullName: string
  scannedAt: string
  score: number
  overallScore: number
  documents: DocumentResult[]
  quickWins: string[]
  summary: {
    total: number
    present: number
    missing: string[]
  }
}

const REQUIRED_DOCS = [
  'README.md',
  'SECURITY.md',
  'CONTRIBUTING.md',
  '.github/CODEOWNERS',
  '.github/dependabot.yml',
  'LICENSE',
  '.github/workflows/ci.yml',
]

function getStalenessLabel(days: number | null): DocumentResult['stalenessLabel'] {
  if (days === null) return 'missing'
  if (days < 30)  return 'fresh'
  if (days < 90)  return 'active'
  if (days < 365) return 'stale'
  return 'critical'
}

function countPlaceholders(content: string): number {
  return (content.match(/\[.*?\]|TODO|FIXME|placeholder|your-/gi) || []).length
}

function calcDocScore(doc: Omit<DocumentResult, 'score'>): number {
  if (!doc.present) return 0
  let s = 40
  if (doc.wordCount > 100) s += 20
  if (doc.wordCount > 300) s += 10
  if (doc.placeholderCount === 0) s += 15
  if (doc.stalenessLabel === 'fresh')  s += 15
  else if (doc.stalenessLabel === 'active') s += 10
  else if (doc.stalenessLabel === 'stale')  s += 5
  return Math.min(s, 100)
}

export async function scanRepository(
  repoFullName: string,
  githubToken?: string
): Promise<ScanResult> {
  const [owner, repo] = repoFullName.split('/')
  const octokit = new Octokit({ auth: githubToken })

  const documents: DocumentResult[] = await Promise.all(
    REQUIRED_DOCS.map(async (filePath): Promise<DocumentResult> => {
      try {
        const { data } = await octokit.repos.getContent({ owner, repo, path: filePath })
        const file = Array.isArray(data) ? null : (data as { content?: string; encoding?: string; size?: number })
        if (!file) throw new Error('is directory')

        let text = ''
        if (file.content && file.encoding === 'base64') {
          text = Buffer.from(file.content, 'base64').toString('utf-8')
        }
        const wordCount = text.split(/\s+/).filter(Boolean).length
        const placeholderCount = countPlaceholders(text)

        const commits = await octokit.repos.listCommits({ owner, repo, path: filePath, per_page: 1 })
        let daysSinceUpdate: number | null = null
        let lastCommitDate: string | null = null
        if (commits.data.length > 0) {
          const raw = commits.data[0].commit.committer?.date ?? commits.data[0].commit.author?.date ?? null
          if (raw) {
            lastCommitDate = raw
            daysSinceUpdate = Math.floor((Date.now() - new Date(raw).getTime()) / (1000 * 60 * 60 * 24))
          }
        }

        const stalenessLabel = getStalenessLabel(daysSinceUpdate)
        const partial = { name: filePath, present: true, wordCount, placeholderCount, daysSinceUpdate, lastCommitDate, stalenessLabel }
        return { ...partial, score: calcDocScore(partial) }
      } catch {
        const partial = {
          name: filePath, present: false, wordCount: 0, placeholderCount: 0,
          daysSinceUpdate: null, lastCommitDate: null, stalenessLabel: 'missing' as const
        }
        return { ...partial, score: 0 }
      }
    })
  )

  const overallScore = Math.round(documents.reduce((sum, d) => sum + d.score, 0) / documents.length)

  const quickWins: string[] = []
  const missing = documents.filter(d => !d.present)
  if (missing.length > 0) quickWins.push(`Add missing files: ${missing.map(d => d.name).join(', ')}`)
  documents.forEach(d => {
    if (d.present && d.placeholderCount > 0) quickWins.push(`Remove ${d.placeholderCount} placeholder(s) in ${d.name}`)
    if (d.present && d.stalenessLabel === 'critical') quickWins.push(`Update ${d.name} — last changed over a year ago`)
    if (d.present && d.wordCount < 100) quickWins.push(`Expand ${d.name} — only ${d.wordCount} words`)
  })

  return {
    repoFullName,
    scannedAt: new Date().toISOString(),
    score: overallScore,
    overallScore,
    documents,
    quickWins: quickWins.slice(0, 5),
    summary: {
      total: REQUIRED_DOCS.length,
      present: documents.filter(d => d.present).length,
      missing: missing.map(d => d.name),
    },
  }
}
