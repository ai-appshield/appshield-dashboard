'use client'

import { useState } from 'react'

interface ScanFile {
  name: string
  present: boolean
  fresh: boolean
  complete: boolean
}

interface ScanResult {
  score: number
  scannedAt: string
  files: ScanFile[]
  summary: {
    total: number
    present: number
    missing: string[]
  }
}

export default function ConnectRepo({ userId }: { userId: string }) {
  const [repoInput, setRepoInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleScan(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoFullName: repoInput.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Scan failed')
      setResult(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const scoreColor =
    result?.score !== undefined
      ? result.score >= 80
        ? '#437a22'
        : result.score >= 50
        ? '#d19900'
        : '#a12c7b'
      : undefined

  return (
    <div>
      {/* Scan Form */}
      <div
        className="rounded-xl border p-6 mb-8"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
          Scan a Repository
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Enter a public GitHub repository in <code>owner/repo</code> format.
        </p>
        <form onSubmit={handleScan} className="flex gap-3">
          <input
            type="text"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            placeholder="e.g. ai-appshield/appshield-dashboard"
            required
            className="flex-1 rounded-lg border px-3 py-2 text-sm"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
          <button
            type="submit"
            disabled={loading || !repoInput.trim()}
            className="rounded-lg px-5 py-2 text-sm font-medium"
            style={{
              background: loading ? 'var(--color-primary-highlight)' : 'var(--color-primary)',
              color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Scanning…' : 'Scan'}
          </button>
        </form>
        {error && (
          <p className="mt-3 text-sm" style={{ color: 'var(--color-error)' }}>
            ⚠️ {error}
          </p>
        )}
      </div>

      {/* Scan Results */}
      {result && (
        <div
          className="rounded-xl border p-6"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              Scan Results
            </h2>
            <div className="text-right">
              <div className="text-3xl font-bold" style={{ color: scoreColor }}>
                {result.score}
                <span className="text-base font-normal" style={{ color: 'var(--color-text-muted)' }}>
                  /100
                </span>
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                AppShield Score
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {result.files.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between rounded-lg px-4 py-3"
                style={{ background: 'var(--color-surface-offset)' }}
              >
                <span className="text-sm font-mono" style={{ color: 'var(--color-text)' }}>
                  {file.name}
                </span>
                <div className="flex gap-2 text-xs">
                  <span
                    className="px-2 py-0.5 rounded-full"
                    style={{
                      background: file.present ? '#d4dfcc' : '#e0ced7',
                      color: file.present ? '#437a22' : '#a12c7b',
                    }}
                  >
                    {file.present ? '✓ Present' : '✗ Missing'}
                  </span>
                  {file.present && (
                    <span
                      className="px-2 py-0.5 rounded-full"
                      style={{
                        background: file.complete ? '#d4dfcc' : '#e9e0c6',
                        color: file.complete ? '#437a22' : '#d19900',
                      }}
                    >
                      {file.complete ? '✓ Complete' : '⚠ Thin'}
                    </span>
                  )}
                  {file.present && (
                    <span
                      className="px-2 py-0.5 rounded-full"
                      style={{
                        background: file.fresh ? '#d4dfcc' : '#e9e0c6',
                        color: file.fresh ? '#437a22' : '#d19900',
                      }}
                    >
                      {file.fresh ? '✓ Fresh' : '⚠ Stale'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {result.summary.missing.length > 0 && (
            <div
              className="mt-4 rounded-lg px-4 py-3"
              style={{ background: 'var(--color-error-highlight)' }}
            >
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-error)' }}>
                Missing files ({result.summary.missing.length})
              </p>
              <ul className="text-xs space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                {result.summary.missing.map((f) => (
                  <li key={f} className="font-mono">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-4 text-xs" style={{ color: 'var(--color-text-faint)' }}>
            Scanned {new Date(result.scannedAt).toLocaleString()} · {result.summary.present}/{result.summary.total} required files present
          </p>
        </div>
      )}
    </div>
  )
}
