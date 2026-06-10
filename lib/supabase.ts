import { createClient } from '@supabase/supabase-js'
import type { ScanResult } from './scanner'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function saveProjectScan(
  userId: string,
  repoFullName: string,
  scanResult: ScanResult
) {
  // Upsert project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .upsert(
      {
        user_id: userId,
        repo_full_name: repoFullName,
        repo_url: `https://github.com/${repoFullName}`,
        last_scanned: scanResult.scannedAt,
        health_score: scanResult.overallScore,
      },
      { onConflict: 'user_id,repo_full_name' }
    )
    .select()
    .single()

  if (projectError) throw projectError

  // Insert document scans
  const docScans = scanResult.documents.map(doc => ({
    project_id: project.id,
    doc_name: doc.name,
    present: doc.present,
    placeholder_count: doc.placeholderCount,
    last_commit_date: doc.lastCommitDate,
    score: doc.score,
    scanned_at: scanResult.scannedAt,
  }))

  const { error: scanError } = await supabase
    .from('document_scans')
    .insert(docScans)

  if (scanError) throw scanError

  return project
}

export async function getProjectScans(userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('last_scanned', { ascending: false })

  if (error) throw error
  return data
}
