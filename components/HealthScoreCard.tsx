'use client'
import { ScanResult } from '@/lib/scanner'

const SCORE_COLORS = {
  great:   { ring: '#00d4ff', label: 'Great',   bg: '#e6fffe' },
  good:    { ring: '#22c55e', label: 'Good',    bg: '#f0fdf4' },
  warning: { ring: '#f59e0b', label: 'Warning', bg: '#fffbeb' },
  poor:    { ring: '#ef4444', label: 'Poor',    bg: '#fef2f2' },
}

function getScoreTier(score: number) {
  if (score >= 80) return SCORE_COLORS.great
  if (score >= 60) return SCORE_COLORS.good
  if (score >= 40) return SCORE_COLORS.warning
  return SCORE_COLORS.poor
}

const STALENESS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  fresh:    { bg: '#dcfce7', text: '#166534', label: '✅ Fresh' },
  active:   { bg: '#dbeafe', text: '#1e40af', label: '🔵 Active' },
  stale:    { bg: '#fef9c3', text: '#854d0e', label: '⚠️ Stale' },
  critical: { bg: '#fee2e2', text: '#991b1b', label: '🔴 Critical' },
  missing:  { bg: '#f3f4f6', text: '#6b7280', label: '❌ Missing' },
}

interface Props {
  result: ScanResult
  repoName: string
}

export default function HealthScoreCard({ result, repoName }: Props) {
  const tier = getScoreTier(result.overallScore)

  // SVG ring math
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (result.overallScore / 100) * circumference

  return (
    <div className="space-y-6">

      {/* Header row */}
      <div className="flex items-center gap-3">
        <div className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
          {repoName}
        </div>
        <span className="text-xs px-2 py-1 rounded-full font-semibold"
          style={{ background: tier.bg, color: tier.ring }}>
          {tier.label}
        </span>
        <span className="text-xs ml-auto" style={{ color: 'var(--color-text-muted)' }}>
          Scanned {new Date(result.scannedAt).toLocaleString()}
        </span>
      </div>

      {/* Score ring + quick stats */}
      <div className="flex items-center gap-10">
        <div className="relative flex-shrink-0">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="12" />
            <circle
              cx="70" cy="70" r={radius}
              fill="none"
              stroke={tier.ring}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 70 70)"
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold" style={{ color: tier.ring }}>
              {result.overallScore}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>/100</span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 flex-1">
          <StatBox
            label="Docs Present"
            value={`${result.documents.filter(d => d.present).length}/${result.documents.length}`}
            color="#00d4ff"
          />
          <StatBox
            label="Placeholders"
            value={String(result.documents.reduce((s, d) => s + d.placeholderCount, 0))}
            color="#f59e0b"
          />
          <StatBox
            label="Quick Wins"
            value={String(result.quickWins.length)}
            color="#8b5cf6"
          />
        </div>
      </div>

      {/* Document status table */}
      <div>
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
          Document Health
        </h2>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-muted)' }}>Document</th>
                <th className="text-center px-4 py-3 font-semibold" style={{ color: 'var(--color-text-muted)' }}>Status</th>
                <th className="text-center px-4 py-3 font-semibold" style={{ color: 'var(--color-text-muted)' }}>Score</th>
                <th className="text-center px-4 py-3 font-semibold" style={{ color: 'var(--color-text-muted)' }}>Words</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-muted)' }}>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {result.documents.map((doc, i) => {
                const badge = STALENESS_BADGE[doc.stalenessLabel]
                return (
                  <tr
                    key={doc.name}
                    style={{
                      background: i % 2 === 0 ? 'var(--color-bg)' : 'var(--color-surface)',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--color-text)' }}>
                      {doc.name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{ background: badge.bg, color: badge.text }}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ScoreBar score={doc.score} />
                    </td>
                    <td className="px-4 py-3 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {doc.present ? doc.wordCount.toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {doc.lastCommitDate
                        ? `${doc.daysSinceUpdate}d ago`
                        : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Wins */}
      {result.quickWins.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
            ⚡ Quick Wins
          </h2>
          <ul className="space-y-2">
            {result.quickWins.map((win, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm px-4 py-3 rounded-lg border"
                style={{
                  borderColor: 'var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                }}
              >
                <span style={{ color: '#f59e0b', flexShrink: 0 }}>→</span>
                {win}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-xl px-4 py-4 text-center border"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
    >
      <div className="text-2xl font-extrabold" style={{ color }}>{value}</div>
      <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
    </div>
  )
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? '#00d4ff' : score >= 60 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex items-center gap-2 justify-center">
      <div className="w-20 h-2 rounded-full" style={{ background: '#e5e7eb' }}>
        <div
          className="h-2 rounded-full"
          style={{ width: `${score}%`, background: color, transition: 'width 0.5s ease' }}
        />
      </div>
      <span className="text-xs font-semibold" style={{ color }}>{score}</span>
    </div>
  )
}
