import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { ScanResult } from './scanner'

// Lazy singleton — client is only created on first real request,
// never at module import time. This prevents the "supabaseUrl is required"
// crash during Next.js static build analysis.
let _supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in Vercel project settings.'
    )
  }
  _supabase = createClient(url, key)
  return _supabase
}

export async function saveProjectScan(
  userId: string,
  repoFullName: string,
  scanResult: ScanResult
) {
  const supabase = getSupabase()
  const { error } = await supabase.from('project_scans').upsert(
    {
      user_id: userId,
      repo_full_name: repoFullName,
      scanned_at: scanResult.scannedAt,
      score: scanResult.overallScore,
      documents: scanResult.documents,
      quick_wins: scanResult.quickWins,
      summary: scanResult.summary,
    },
    { onConflict: 'user_id,repo_full_name' }
  )
  if (error) {
    console.error('Supabase save error:', error)
    throw new Error(`Failed to save scan: ${error.message}`)
  }
}

export async function getProjectScans(userId: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('project_scans')
    .select('*')
    .eq('user_id', userId)
    .order('scanned_at', { ascending: false })
  if (error) throw new Error(`Failed to fetch scans: ${error.message}`)
  return data
}
