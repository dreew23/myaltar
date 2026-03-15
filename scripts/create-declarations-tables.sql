-- Declarations & Declaration Logs tables
-- Run this in Supabase SQL Editor

-- ═══════════════════════════════════════════════════════
-- 1. declarations — user's daily spoken declarations
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS declarations (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  display_order     integer NOT NULL,
  area              text NOT NULL CHECK (area IN ('identity','authority','health','career','finances','wisdom','protection','relationships','purpose','legacy')),
  content           text NOT NULL,
  scripture_reference text NOT NULL,
  scripture_text    text,
  target_count      integer DEFAULT 1,
  active            boolean DEFAULT true,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

ALTER TABLE declarations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own declarations"
  ON declarations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_declarations_user_active ON declarations(user_id, active);

-- ═══════════════════════════════════════════════════════
-- 2. declaration_logs — daily counter per declaration
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS declaration_logs (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  declaration_id    uuid REFERENCES declarations(id) ON DELETE CASCADE NOT NULL,
  date              date DEFAULT CURRENT_DATE,
  current_count     integer DEFAULT 0,
  target_count      integer NOT NULL,
  completed         boolean DEFAULT false,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),
  UNIQUE(user_id, declaration_id, date)
);

ALTER TABLE declaration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own declaration logs"
  ON declaration_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_declaration_logs_user_date ON declaration_logs(user_id, date);
CREATE INDEX idx_declaration_logs_user_decl_date ON declaration_logs(user_id, declaration_id, date);

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';
