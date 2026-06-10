import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import ConnectRepo from '@/components/ConnectRepo'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              AppShield Dashboard
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }} className="text-sm mt-1">
              Connect a repository to analyze its AppShield health
            </p>
          </div>
        </div>

        {/* Sprint 1: Repo connection UI */}
        <ConnectRepo userId={userId} />
      </div>
    </main>
  )
}
