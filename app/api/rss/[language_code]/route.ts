import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^---$/gm, '<hr/>')
    .replace(/\n\n/g, '</p><p>')
}

export async function GET(
  req: NextRequest,
  { params }: { params: { language_code: string } }
) {
  const supabase = createAdminClient()

  const { data: brand } = await supabase
    .from('brands')
    .select('id, brand_name, language_code')
    .eq('language_code', params.language_code)
    .single()

  if (!brand) {
    return new NextResponse('Brand not found', { status: 404 })
  }

  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, slug, meta_description, content_markdown, published_at, keyword_source, featured_image')
    .eq('brand_id', brand.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(50)

  // Site URL based on language
  const siteUrl = params.language_code === 'es'
    ? 'https://essentialsynergybr.com/es'
    : 'https://essentialsynergybr.com'

  const feedUrl = `https://soloseo-cfege6036-brondors-projects.vercel.app/api/rss/${params.language_code}`
  const now = new Date().toUTCString()

  const items = (articles ?? []).map((a) => {
    const link = `${siteUrl}/blog/${a.slug}`
    const pubDate = new Date(a.published_at).toUTCString()
    const htmlContent = markdownToHtml(a.content_markdown ?? '')

    return `
    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(a.meta_description ?? '')}</description>
      <content:encoded><![CDATA[${htmlContent}]]></content:encoded>
      ${a.featured_image ? `<enclosure url="${escapeXml(a.featured_image)}" type="image/jpeg"/>` : ''}
      ${a.keyword_source ? `<category>${escapeXml(a.keyword_source)}</category>` : ''}
    </item>`
  }).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(brand.brand_name)}</title>
    <link>${siteUrl}</link>
    <description>Artículos sobre aceites esenciales doTERRA</description>
    <language>${brand.language_code}-ES</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
