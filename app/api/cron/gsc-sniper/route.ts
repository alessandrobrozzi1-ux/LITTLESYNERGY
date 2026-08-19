import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getGscClient } from '@/lib/gsc'
import { runSniper } from '@/lib/gsc-sniper'

// ═══ OPERAZIONE CECCHINO v1 — cron settimanale (SOLO pilota, 1 ago 2026) ═══
// GSC striking-distance (pos 5-20, impr ≥20/7gg) → iniezione nel pool `keywords` come
// status='scheduled' (ramo 1 di daily-publish: usata al posto della pesca cieca, volume invariato).
// GUARDIA 1 anti-doppione pre-iniezione nel modulo lib/gsc-sniper (trigram vs titoli+history+pool;
// simile → sniper_reinforce per la maglia interna). Cap 2/settimana/lingua.
//
// 🚨 DRY-RUN DI DEFAULT: senza ?apply=1 NON scrive nulla — riporta candidate/uccise/iniettabili.
// Il cron-job.org si arma SOLO dopo l'ok del capofila sul report dry-run, con ?apply=1.
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const gsc = getGscClient()
  if (!gsc) return NextResponse.json({ error: 'GSC credential (GSC_CREDENTIALS_B64) not configured' }, { status: 500 })

  const apply = req.nextUrl.searchParams.get('apply') === '1'
  try {
    const report = await runSniper(gsc, createAdminClient(), { apply })
    return NextResponse.json({ mode: apply ? 'APPLY' : 'DRY-RUN', ...report })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
