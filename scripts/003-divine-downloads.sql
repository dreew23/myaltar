-- Create divine_downloads table for quick revelation captures
CREATE TABLE IF NOT EXISTS divine_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'revelation',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE divine_downloads ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "divine_downloads_select_own" ON divine_downloads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "divine_downloads_insert_own" ON divine_downloads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "divine_downloads_update_own" ON divine_downloads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "divine_downloads_delete_own" ON divine_downloads FOR DELETE USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_divine_downloads_user_date ON divine_downloads(user_id, created_at DESC);
