-- Pinterest auto-pin integration — schema (run in Supabase SQL editor)
-- Idempotent: safe to run multiple times.

-- v3.4: vertical pin image (1024x1536), ADDITIVE — never replaces featured_image (horizontal blog)
ALTER TABLE articles ADD COLUMN IF NOT EXISTS pinterest_image TEXT;

CREATE TABLE IF NOT EXISTS pinterest_boards (
  id            TEXT PRIMARY KEY,              -- Pinterest board id
  board_name    TEXT NOT NULL,
  language_code TEXT NOT NULL,                 -- en | es
  topic_category TEXT,                         -- main | sleep | lifestyle | ...
  is_main_board BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pinterest_pins (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id       UUID REFERENCES articles(id) ON DELETE CASCADE,
  brand_id         UUID REFERENCES brands(id) ON DELETE CASCADE,
  board_id         TEXT NOT NULL,
  pinterest_pin_id TEXT,
  pin_url          TEXT,
  pin_title        TEXT,
  pin_description  TEXT,
  hashtags         TEXT[],
  status           TEXT DEFAULT 'pending',     -- pending | pinned_trial | pinned | error
  pinned_at        TIMESTAMPTZ,
  error_message    TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pinterest_pins_article ON pinterest_pins(article_id);
CREATE INDEX IF NOT EXISTS idx_pinterest_pins_status  ON pinterest_pins(status);
CREATE INDEX IF NOT EXISTS idx_pinterest_pins_brand   ON pinterest_pins(brand_id);
