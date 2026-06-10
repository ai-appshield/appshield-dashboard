import { fetchDocFiles } from './github'

const APPSHIELD_DOCS = [
  'conventions.md',
  'locked-patterns.md',
  'knowledge-base.md',
  'session-handoff.md',
  'update-process.md',
  'decision-log.md',
  'agent-workflow.md',
]

export interface DocScore {
  name: string
  present: boolean
  score: number
  placeholderCount: number
  wordCount: number
  lastCommitDate: string | null
  daysSinceUpdate: number | null
  stalenessLabel: 'fresh' | 'active' | 'stale' | 'critical' | 'missing'
  issues: string[]
}

export interface ScanResult {
  overallScore: number
  documents: DocScore[]
  quickWins: string[]
  scannedAt: string
}

function countPlaceholders(content: string): number {
  const matches = content.match(/\[PLACEHOLDER[^\]]*\]/g)
  return matches ? matches.length : 0
}

function countWords(content: string): number {
  return content.trim().split(/\s+/).length
}

function getDaysSince(dateStr: string): number {
  const then = new Date(dateStr).getTime()
  const now = Date.now()
  return Math.floor((now - then) / (1000 * 60 * 60 * 24))
}

function getStalenessLabel(
  docName: string,
  days: number | null
): DocScore['stalenessLabel'] {
  if (days === null) return 'missing'
  // session-handoff.md has stricter rules
  if (docName === 'session-handoff.md') {
    if (days <= 2) return 'fresh'
    if (days <= 7) return 'active'
    if (days <= 14) return 'stale'
    return 'critical'
  }
  if (days <= 7) return 'fresh'
  if (days <= 30) return 'active'
  if (days <= 60) return 'stale'
  return 'critical'
}

function scoreDocument(name: string, content: string | null, lastCommitDate: string | null): DocScore {
  const issues: string[] = []
  let score = 0

  if (!content) {
    return {
      name,
      present: false,
      score: 0,
      placeholderCount: 0,
      wordCount: 0,
      lastCommitDate: null,
      daysSinceUpdate: null,
      stalenessLabel: 'missing',
      issues: [`${name} is missing — create it from the AppShield template`],
    }
  }

  score += 20 // present

  const placeholderCount = countPlaceholders(content)
  if (placeholderCount === 0) {
    score += 30
  } else {
    issues.push(`Fill ${placeholderCount} remaining placeholder${placeholderCount > 1 ? 's' : ''} in ${name}`)
  }

  const daysSinceUpdate = lastCommitDate ? getDaysSince(lastCommitDate) : null
  const stalenessLabel = getStalenessLabel(name, daysSinceUpdate)

  if (daysSinceUpdate !== null && daysSinceUpdate < 30) {
    score += 25
  } else if (daysSinceUpdate !== null) {
    issues.push(`${name} hasn't been updated in ${daysSinceUpdate} days`)
  }

  const wordCount = countWords(content)
  if (wordCount > 100) {
    score += 25
  } else {
    issues.push(`${name} looks incomplete — add more detail (currently ${wordCount} words)`)
  }

  return {
    name,
    present: true,
    score,
    placeholderCount,
    wordCount,
    lastCommitDate,
    daysSinceUpdate,
    stalenessLabel,
    issues,
  }
}

export async function scanRepository(repoFullName: string, token?: string): Promise<ScanResult> {
  const docFiles = await fetchDocFiles(repoFullName, token)

  const documents = APPSHIELD_DOCS.map(name =>
    scoreDocument(name, docFiles[name].content, docFiles[name].lastCommitDate)
  )

  const overallScore = Math.round(
    documents.reduce((sum, d) => sum + d.score, 0) / documents.length
  )

  // Generate Quick Wins from all issues, prioritized
  const allIssues = documents.flatMap(d => d.issues)
  const quickWins = allIssues.slice(0, 5)

  return {
    overallScore,
    documents,
    quickWins,
    scannedAt: new Date().toISOString(),
  }
}
