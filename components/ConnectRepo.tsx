'use client'
import { useState } from 'react'

interface ConnectRepoProps {
  userId: string
}

export default function ConnectRepo({ userId }: ConnectRepoProps) {
  const [repoInput, setRepoInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  async function handleScan(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoFullName: repoInput }),
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
      {/* Connect form */}
      <form onSubmit={handleScan} className="flex gap-3 mb-8">
        <input
          type="text"
          value={repoInput}
          onChange={e => setRepoInput(e.target.value)}
          placeholder="owner/repository  (e.g. NerdChild137/sportshub)"
          className="flex-1 px-4 py-2 rounded-lg border text-sm"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 rounded-lg font-semibold text-white text-sm disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {loading ? 'Scanning...' : 'Scan Repo'}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg mb-6 text-sm" style={{ background: '#fdecea', color: 'var(--color-error)' }}>
          {error}
        </div>
      )}

      {/* Results placeholder — Sprint 3 will replace this with full UI */}
      {result && (
        <div className="p-6 rounded-lg border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
          <p className="text-sm font-semibold mb-2">Scan complete ✅</p>
          <p className="text-4xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {result.overallScore}/100
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Overall Health Score</p>
          <pre className="mt-4 text-xs overflow-auto" style={{ color: 'var(--color-text-muted)' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <div className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>
          <p className="text-lg mb-2">No repository connected yet</p>
          <p className="text-sm">Enter a GitHub repo above to analyze its AppShield health</p>
        </div>
      )}
    </div>
  )
}
