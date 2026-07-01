-- Run this in Supabase SQL Editor

create table brands (
  id uuid primary key default gen_random_uuid(),
  language_code text unique not null,
  language_name text not null,
  brand_name text not null,
  domain text not null default '',
  brand_dna_business_type text not null default '',
  brand_dna_service_area text not null default '',
  brand_dna_topics_to_avoid text not null default '',
  brand_dna_key_themes text not null default '',
  brand_dna_brand_voice text not null default '',
  brand_dna_mandatory_footer text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table articles (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  title text not null,
  slug text not null,
  meta_description text not null default '',
  content_markdown text not null,
  keyword_source text not null,
  status text not null default 'published' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table keywords_history (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  keyword text not null,
  source text not null check (source in ('pytrends', 'claude_fallback')),
  used_at timestamptz not null default now(),
  article_id uuid references articles(id) on delete set null
);

-- Indexes for performance
create index articles_brand_id_idx on articles(brand_id);
create index articles_status_idx on articles(status);
create index articles_published_at_idx on articles(published_at desc);
create index keywords_history_brand_id_idx on keywords_history(brand_id);

-- Enable RLS
alter table brands enable row level security;
alter table articles enable row level security;
alter table keywords_history enable row level security;

-- Allow authenticated user full access (single-user app)
create policy "authenticated full access" on brands for all using (auth.role() = 'authenticated');
create policy "authenticated full access" on articles for all using (auth.role() = 'authenticated');
create policy "authenticated full access" on keywords_history for all using (auth.role() = 'authenticated');

-- Service role bypass for cron
create policy "service role bypass" on brands for all using (auth.role() = 'service_role');
create policy "service role bypass" on articles for all using (auth.role() = 'service_role');
create policy "service role bypass" on keywords_history for all using (auth.role() = 'service_role');

-- RSS feed is public (read-only on published articles)
create policy "public read published articles" on articles for select using (status = 'published');
create policy "public read brands" on brands for select using (true);
