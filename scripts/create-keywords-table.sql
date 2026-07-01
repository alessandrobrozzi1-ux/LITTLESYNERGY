CREATE TABLE IF NOT EXISTS keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  volume TEXT CHECK (volume IN ('low', 'medium', 'high')) DEFAULT 'medium',
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  relevance INTEGER DEFAULT 7,
  status TEXT CHECK (status IN ('pending', 'scheduled', 'used', 'rejected')) DEFAULT 'pending',
  scheduled_date DATE,
  article_id UUID REFERENCES articles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS keywords_brand_id_idx ON keywords(brand_id);
CREATE INDEX IF NOT EXISTS keywords_status_idx ON keywords(status);
CREATE INDEX IF NOT EXISTS keywords_created_at_idx ON keywords(created_at DESC);

ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own keywords" ON keywords
  USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));
