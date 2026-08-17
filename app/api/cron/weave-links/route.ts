import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { runWeave } from '@/lib/weave-links'

// ═══ MAGLIA INTERNA v1 — cron settimanale weave-links (SOLO pilota, 1 ago 2026) ═══
// Articoli pubblicati negli ultimi 7gg → blocco "Leggi anche" innestato nei 2-3 correlati più
// vecchi (embeddings, threshold 0.5). Marker HTML-comment: re-run sostituisce, rollback pulito.
// Consuma sniper_reinforce (Operazione Cecchino). Dettagli e regole in lib/weave-links.ts.
// ?dry=1 = preview senza scritture.
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const dry = req.nextUrl.searchParams.get('dry') === '1'
  // ?days=3650 → prima passata su TUTTO l'archivio (recupero degli articoli orfani mai linkati);
  // senza il parametro resta la finestra di 7 giorni, quella giusta per il cron settimanale.
  const days = Number(req.nextUrl.searchParams.get('days'))
  const windowDays = Number.isFinite(days) && days > 0 ? days : undefined
  try {
    const report = await runWeave(createAdminClient(), { dry, windowDays })
    return NextResponse.json({ mode: dry ? 'DRY-RUN' : 'APPLY', window_days: windowDays ?? 7, ...report })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
