import { NextRequest, NextResponse } from 'next/server'

// OAuth redirect URI: https://soloseo-alpha.vercel.app/api/pinterest/callback
// Used only when (re)authorizing the app — e.g. after Standard Access approval.
// Exchanges ?code= for an access token. Requires PINTEREST_APP_ID + PINTEREST_APP_SECRET env vars.
// The token is returned ONCE in the response — copy it into PINTEREST_ACCESS_TOKEN env var.
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'missing ?code' }, { status: 400 })

  const appId = process.env.PINTEREST_APP_ID
  const secret = process.env.PINTEREST_APP_SECRET
  if (!appId || !secret) {
    return NextResponse.json({ error: 'PINTEREST_APP_ID / PINTEREST_APP_SECRET not configured' }, { status: 500 })
  }

  const redirectUri = `${req.nextUrl.origin}/api/pinterest/callback`
  const basic = Buffer.from(`${appId}:${secret}`).toString('base64')

  const res = await fetch('https://api.pinterest.com/v5/oauth/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri }),
  })
  const data = await res.json()
  if (!res.ok) return NextResponse.json({ error: 'token exchange failed', detail: data }, { status: res.status })

  return NextResponse.json({
    message: 'Copy access_token into the PINTEREST_ACCESS_TOKEN env var on Vercel, then redeploy.',
    access_token: data.access_token,
    token_type: data.token_type,
    scope: data.scope,
  })
}
