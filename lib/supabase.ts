import { createClient } from '@supabase/supabase-js'
import type { ScanResult } from './scanner'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function saveProjectScan(
  userId: string,
  repoFullName: string,
  scanResult: ScanResult
) {
  const { error } = await supabase.from('project_scans').upsert(
    {
      user_id: userId,
      repo_full_name: repoFullName,
      scanned_at: scanResult.scannedAt,
      score: scanResult.score,
      files: scanResult.files,
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
  const { data, error } = await supabase
    .from('project_scans')
    .select('*')
    .eq('user_id', userId)
    .order('scanned_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch scans: ${error.message}`)
  return data
}
