import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
          AppShield Dashboard
        </h1>
        <p className="text-lg mb-2" style={{ color: 'var(--color-text-muted)' }}>
          Analyze your AI AppShield docs. Score compliance. Get quick wins.
        </p>
        <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>
          Part of the <a href="https://github.com/ai-appshield/ai-shield" target="_blank" rel="noopener noreferrer" className="underline">AI AppShield</a> ecosystem by TraghmTech
        </p>

        <SignedOut>
          <SignInButton mode="modal">
            <button
              className="px-6 py-3 rounded-lg font-semibold text-white transition-colors"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Sign in with GitHub
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 rounded-lg font-semibold text-white transition-colors"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Go to Dashboard →
          </Link>
        </SignedIn>
      </div>
    </main>
  )
}
