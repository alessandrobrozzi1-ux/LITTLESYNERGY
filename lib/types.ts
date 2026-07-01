export interface Brand {
  id: string
  language_code: string
  language_name: string
  brand_name: string
  domain: string
  owner_id?: string
  affiliate_base_url?: string
  brand_dna_business_type: string
  brand_dna_service_area: string
  brand_dna_topics_to_avoid: string
  brand_dna_key_themes: string
  brand_dna_brand_voice: string
  brand_dna_mandatory_footer: string
  active: boolean
  created_at: string
}

export interface Article {
  id: string
  brand_id: string
  title: string
  slug: string
  meta_description: string
  content_markdown: string
  keyword_source: string
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  brands?: Pick<Brand, 'brand_name' | 'language_code' | 'language_name'>
}

export interface KeywordHistory {
  id: string
  brand_id: string
  keyword: string
  source: 'pytrends' | 'claude_fallback'
  used_at: string
  article_id: string | null
}
