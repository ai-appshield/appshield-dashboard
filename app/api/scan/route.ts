import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { scanRepository } from '@/lib/scanner'
import { saveProjectScan } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { repoFullName, githubToken } = await req.json()
  if (!repoFullName) return NextResponse.json({ error: 'repoFullName required' }, { status: 400 })

  try {
    const scanResult = await scanRepository(repoFullName, githubToken)
    await saveProjectScan(userId, repoFullName, scanResult)
    return NextResponse.json({ success: true, data: scanResult })
  } catch (error) {
    console.error('Scan error:', error)
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 })
  }
}
