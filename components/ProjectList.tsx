'use client'
import { useEffect, useState } from 'react'

interface Project {
  id: string
  repo_full_name: string
  health_score: number | null
  last_scanned: string | null
  repo_url: string | null
}

interface Props {
  onRescan: (repoName: string) => void
}

export default function ProjectList({ onRescan }: Props) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(d => setProjects(d.projects || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="text-sm py-4" style={{ color: 'var(--color-text-muted)' }}>
        Loading projects...
      </div>
    )
  }

  if (projects.length === 0) return null

  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
        Previously Scanned Repos
      </h2>
      <div className="space-y-2">
        {projects.map(p => {
          const score = p.health_score
          const color = score === null ? '#9ca3af'
            : score >= 80 ? '#00d4ff'
            : score >= 60 ? '#22c55e'
            : score >= 40 ? '#f59e0b'
            : '#ef4444'
          return (
            <div
              key={p.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl border"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono" style={{ color: 'var(--color-text)' }}>
                  {p.repo_full_name}
                </span>
                {score !== null && (
                  <span className="text-xs font-bold" style={{ color }}>
                    {score}/100
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {p.last_scanned && (
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(p.last_scanned).toLocaleDateString()}
                  </span>
                )}
                <button
                  onClick={() => onRescan(p.repo_full_name)}
                  className="text-xs px-3 py-1 rounded-lg font-semibold"
                  style={{
                    background: 'var(--color-primary-dim, #e6fffe)',
                    color: 'var(--color-primary, #00d4ff)',
                    border: '1px solid var(--color-primary, #00d4ff)',
                  }}
                >
                  Re-scan
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
