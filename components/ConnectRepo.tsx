'use client'
import { useState } from 'react'
import HealthScoreCard from './HealthScoreCard'
import ProjectList from './ProjectList'
import { ScanResult } from '@/lib/scanner'

interface ConnectRepoProps {
  userId: string
}

export default function ConnectRepo({ userId }: ConnectRepoProps) {
  const [repoInput, setRepoInput] = useState('')
  const [tokenInput, setTokenInput] = useState('')
  const [showTokenField, setShowTokenField] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [scannedRepo, setScannedRepo] = useState('')

  async function handleScan(repoOverride?: string) {
    const repo = repoOverride || repoInput
    if (!repo) return
    setLoading(true)
    setError(null)
    setResult(null)
    setScannedRepo(repo)

    try {
      const body: Record<string, string> = { repoFullName: repo }
      if (tokenInput.trim()) body.githubToken = tokenInput.trim()

      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Scan failed')
      setResult(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Previously scanned projects */}
      <ProjectList onRescan={(repo) => {
        setRepoInput(repo)
        handleScan(repo)
      }} />

      {/* Scan form */}
      <form onSubmit={e => { e.preventDefault(); handleScan() }} className="space-y-3 mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={repoInput}
            onChange={e => setRepoInput(e.target.value)}
            placeholder="owner/repository  (e.g. NerdChild137/Sportshub)"
            className="flex-1 px-4 py-2 rounded-lg border text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-lg font-semibold text-white text-sm disabled:opacity-50"
            style={{ backgroundColor: '#00d4ff', color: '#000' }}
          >
            {loading ? 'Scanning...' : 'Scan Repo'}
          </button>
        </div>

        {/* Token toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowTokenField(!showTokenField)}
            className="text-xs"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {showTokenField ? '▾ Hide' : '▸ Private repo?'} Add GitHub token
          </button>
          {showTokenField && (
            <input
              type="password"
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              placeholder="GitHub Personal Access Token (repo scope)"
              className="mt-2 w-full px-4 py-2 rounded-lg border text-sm font-mono"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
            />
          )}
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg mb-6 text-sm" style={{ background: '#fdecea', color: '#991b1b' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm">Scanning {scannedRepo}...</p>
          <p className="text-xs mt-1">Reading /docs folder and scoring documents</p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div
          className="p-6 rounded-2xl border"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
        >
          <HealthScoreCard result={result} repoName={scannedRepo} />
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <div className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>
          <div className="text-5xl mb-4">🛡️</div>
          <p className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
            Analyze your AppShield health
          </p>
          <p className="text-sm">Enter a GitHub repo above to get your documentation score</p>
        </div>
      )}
    </div>
  )
}
