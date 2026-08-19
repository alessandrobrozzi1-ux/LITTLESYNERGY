import { JWT } from 'google-auth-library'

/**
 * Google Search Console — READ-ONLY. Reads Search Analytics for the empire brands
 * via a service account (scope webmasters.readonly). Only searchanalytics.query +
 * sites.list are called — never any write. Credential lives in GSC_CREDENTIALS_B64
 * (.env.local / Vercel, base64 of the service-account JSON), never in git.
 * TEMPO 2 of the empire intelligence dashboard.
 */

export type GscTopQuery = { query: string; clicks: number; impressions: number; position: number }
export type GscLangStat = { lang: string; clicks: number; impressions: number; position: number }

export type GscMetrics = {
  configured: boolean // credential present
  granted: boolean    // SA has access to a matching GSC property
  siteUrl?: string
  clicks: number
  impressions: number
  ctr: number
  position: number
  impressionsPrev: number
  trend: 'up' | 'down' | 'flat' | null
  trendPct: number | null
  topQueries: GscTopQuery[]
  byLanguage: GscLangStat[] // per-language breakdown (from page-path subfolders)
  error?: string
}

const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'

// Site subfolders that map to a language. Root (no known subfolder) = English.
// Note: the essentialsynergy site uses /jp/ for Japanese → display as 'ja'.
const SUBFOLDER_LANGS = new Set(['es', 'de', 'fr', 'pt', 'ro', 'jp', 'ar', 'it', 'nl', 'pl'])

function langOfPage(pageUrl: string): string {
  try {
    const seg = new URL(pageUrl).pathname.split('/').filter(Boolean)[0]?.toLowerCase() ?? ''
    if (SUBFOLDER_LANGS.has(seg)) return seg === 'jp' ? 'ja' : seg
    return 'en'
  } catch {
    return 'en'
  }
}

function ymd(d: Date) { return d.toISOString().slice(0, 10) }

/** One JWT client for the whole render (reused across brands). null if no credential. */
export function getGscClient(): JWT | null {
  const b64 = process.env.GSC_CREDENTIALS_B64
  if (!b64) return null
  try {
    const creds = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'))
    return new JWT({ email: creds.client_email, key: creds.private_key, scopes: [SCOPE] })
  } catch {
    return null
  }
}

async function queryRows(
  client: JWT, siteUrl: string, startDate: string, endDate: string,
  dimensions: string[], rowLimit: number
): Promise<any[]> {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`
  const res = await client.request<{ rows?: any[] }>({
    url, method: 'POST', data: { startDate, endDate, dimensions, rowLimit },
  })
  return res.data.rows ?? []
}

const emptyMetrics = (configured: boolean): GscMetrics => ({
  configured, granted: false, clicks: 0, impressions: 0, ctr: 0, position: 0,
  impressionsPrev: 0, trend: null, trendPct: null, topQueries: [], byLanguage: [],
})

/**
 * Aggregate GSC for a brand. matchKeywords select which accessible property/ies
 * belong to this brand (e.g. ['essentialsynergybr']). Prefers a sc-domain property
 * (covers all language subfolders). GSC data lags ~2 days, so the window ends today-2.
 */
export async function fetchBrandGsc(client: JWT | null, matchKeywords: string[]): Promise<GscMetrics> {
  if (!client) return emptyMetrics(false)
  try {
    const sitesRes = await client.request<{ siteEntry?: { siteUrl: string; permissionLevel: string }[] }>({
      url: 'https://www.googleapis.com/webmasters/v3/sites',
    })
    const entries = (sitesRes.data.siteEntry ?? []).filter(e => e.permissionLevel !== 'siteUnverifiedUser')
    const matched = entries.filter(e =>
      matchKeywords.some(k => e.siteUrl.toLowerCase().includes(k.toLowerCase()))
    )
    if (matched.length === 0) return emptyMetrics(true) // credential ok, not granted yet

    const target = matched.find(e => e.siteUrl.startsWith('sc-domain:')) ?? matched[0]
    const site = target.siteUrl

    const end = new Date(Date.now() - 2 * 864e5)
    const start = new Date(end.getTime() - 27 * 864e5)
    const prevEnd = new Date(start.getTime() - 864e5)
    const prevStart = new Date(prevEnd.getTime() - 27 * 864e5)

    const [totals, prevTotals, top, pages] = await Promise.all([
      queryRows(client, site, ymd(start), ymd(end), [], 1),
      queryRows(client, site, ymd(prevStart), ymd(prevEnd), [], 1),
      queryRows(client, site, ymd(start), ymd(end), ['query'], 5),
      queryRows(client, site, ymd(start), ymd(end), ['page'], 1000),
    ])

    // per-language: bucket pages by subfolder, position = impression-weighted average
    const acc: Record<string, { clicks: number; impressions: number; posSum: number }> = {}
    for (const r of pages) {
      const lang = langOfPage(r.keys?.[0] ?? '')
      const b = (acc[lang] ??= { clicks: 0, impressions: 0, posSum: 0 })
      b.clicks += r.clicks
      b.impressions += r.impressions
      b.posSum += r.position * r.impressions
    }
    const byLanguage: GscLangStat[] = Object.entries(acc)
      .filter(([, v]) => v.impressions > 0)
      .map(([lang, v]) => ({ lang, clicks: v.clicks, impressions: v.impressions, position: v.posSum / v.impressions }))
      .sort((a, b) => b.impressions - a.impressions)

    const t = totals[0] ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 }
    const p = prevTotals[0] ?? { clicks: 0, impressions: 0 }
    const trendPct = p.impressions > 0
      ? ((t.impressions - p.impressions) / p.impressions) * 100
      : (t.impressions > 0 ? 100 : null)
    const trend: GscMetrics['trend'] =
      trendPct == null ? null : trendPct > 5 ? 'up' : trendPct < -5 ? 'down' : 'flat'

    return {
      configured: true, granted: true, siteUrl: site,
      clicks: t.clicks, impressions: t.impressions, ctr: t.ctr, position: t.position,
      impressionsPrev: p.impressions, trend, trendPct,
      topQueries: top.map(r => ({
        query: r.keys?.[0] ?? '', clicks: r.clicks, impressions: r.impressions, position: r.position,
      })),
      byLanguage,
    }
  } catch (e) {
    return { ...emptyMetrics(true), error: e instanceof Error ? e.message : String(e) }
  }
}

// ── Empire history (War Council): capture a full daily snapshot per brand (28d + 7d windows). ──
// Stored in empire.gsc_snapshots so the strategist can detect multi-day position/impression movement.
// Read-only against GSC; the caller persists via the public.record_gsc_snapshot RPC.
export type GscTotals = { clicks: number; impressions: number; ctr: number; position: number }
export type GscPageStat = { page: string; clicks: number; impressions: number; position: number }
export type GscDayStat = { date: string; clicks: number; impressions: number; ctr: number; position: number }
export type GscSnapshotPayload = {
  brand_key: string
  site_url: string
  captured_on: string
  window_end: string
  totals_28d: GscTotals
  totals_7d: GscTotals
  queries_28d: GscTopQuery[]
  queries_7d: GscTopQuery[]
  pages_28d: GscPageStat[]
  by_language: GscLangStat[]
  series_60d: GscDayStat[] // giorno-per-giorno (60g fino a window_end): abilita i tagli Ieri/7g/28g + delta esatti
}

const ZERO_TOTALS: GscTotals = { clicks: 0, impressions: 0, ctr: 0, position: 0 }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toTotals = (r: any): GscTotals => r ? { clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position } : ZERO_TOTALS
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toQuery = (r: any): GscTopQuery => ({ query: r.keys?.[0] ?? '', clicks: r.clicks, impressions: r.impressions, position: r.position })

/** Capture one brand's daily GSC snapshot (null if no accessible matching property). */
export async function captureBrandSnapshot(client: JWT | null, brandKey: string, matchKeywords: string[]): Promise<GscSnapshotPayload | null> {
  if (!client) return null
  const sitesRes = await client.request<{ siteEntry?: { siteUrl: string; permissionLevel: string }[] }>({
    url: 'https://www.googleapis.com/webmasters/v3/sites',
  })
  const entries = (sitesRes.data.siteEntry ?? []).filter(e => e.permissionLevel !== 'siteUnverifiedUser')
  const matched = entries.filter(e => matchKeywords.some(k => e.siteUrl.toLowerCase().includes(k.toLowerCase())))
  if (matched.length === 0) return null
  const site = (matched.find(e => e.siteUrl.startsWith('sc-domain:')) ?? matched[0]).siteUrl

  const end = new Date(Date.now() - 2 * 864e5)
  const start28 = new Date(end.getTime() - 27 * 864e5)
  const start7 = new Date(end.getTime() - 6 * 864e5)
  const start60 = new Date(end.getTime() - 59 * 864e5) // 60g: copre 28g correnti + 28g precedenti per i delta

  const [t28, t7, q28, q7, pg28, days] = await Promise.all([
    queryRows(client, site, ymd(start28), ymd(end), [], 1),
    queryRows(client, site, ymd(start7), ymd(end), [], 1),
    queryRows(client, site, ymd(start28), ymd(end), ['query'], 200),
    queryRows(client, site, ymd(start7), ymd(end), ['query'], 200),
    queryRows(client, site, ymd(start28), ymd(end), ['page'], 200),
    queryRows(client, site, ymd(start60), ymd(end), ['date'], 100),
  ])

  const acc: Record<string, { clicks: number; impressions: number; posSum: number }> = {}
  for (const r of pg28) {
    const lang = langOfPage(r.keys?.[0] ?? '')
    const b = (acc[lang] ??= { clicks: 0, impressions: 0, posSum: 0 })
    b.clicks += r.clicks; b.impressions += r.impressions; b.posSum += r.position * r.impressions
  }
  const by_language: GscLangStat[] = Object.entries(acc)
    .filter(([, v]) => v.impressions > 0)
    .map(([lang, v]) => ({ lang, clicks: v.clicks, impressions: v.impressions, position: v.posSum / v.impressions }))
    .sort((a, b) => b.impressions - a.impressions)

  return {
    brand_key: brandKey, site_url: site,
    captured_on: ymd(new Date()), window_end: ymd(end),
    totals_28d: toTotals(t28[0]), totals_7d: toTotals(t7[0]),
    queries_28d: q28.map(toQuery), queries_7d: q7.map(toQuery),
    pages_28d: pg28.map((r): GscPageStat => ({ page: r.keys?.[0] ?? '', clicks: r.clicks, impressions: r.impressions, position: r.position })),
    by_language,
    series_60d: days
      .map((r): GscDayStat => ({ date: r.keys?.[0] ?? '', clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  }
}
