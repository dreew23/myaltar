-- ============================================================
-- SERMON JOURNAL FIELDS
-- Extends public.sermons with the structured 8-section sermon
-- journal (The Record / Burden / Teaching / Revelation /
-- Response / Formation Link / Retention Loop / Verdict).
--
-- Idempotent: safe to run multiple times.
-- Run in Supabase SQL Editor (Dashboard -> SQL Editor -> New Query).
-- ============================================================

-- 1 · The Record
ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS platform text;          -- 'koinonia' | 'ntc' | 'other' | free text
ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS sermon_date date;       -- date the message was preached
ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS series text;
ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS scripture_anchors text[] DEFAULT '{}';
-- (Minister = existing `speaker`; Recording link = existing `source_url`)

-- 2 · The Burden (one sentence)
ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS burden text;

-- 3 · The Teaching
ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS core_points jsonb DEFAULT '[]'::jsonb;      -- string[]
ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS key_scriptures jsonb DEFAULT '[]'::jsonb;   -- { ref, angle }[]
ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS quotes jsonb DEFAULT '[]'::jsonb;           -- string[]

-- 4 · The Revelation (graduates to Divine Downloads)
ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS revelation text;
ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS revelation_download_id uuid;                -- FK-ish link to divine_downloads.id

-- 5 · The Response (exactly four)
ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS response_conviction text;
ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS response_declaration text;
ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS response_prayer_point text;
ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS response_action text;
ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS response_action_deadline date;
ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS response_declaration_id uuid;               -- link to declarations.id when pushed
ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS response_action_routed boolean DEFAULT false;

-- 6 · The Formation Link
ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS formation_link text;

-- 7 · The Retention Loop
ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS teach_it_test boolean DEFAULT false;
ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS seven_day_review text;
ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS spaced_summary text;

-- 8 · Verdict + Status
ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS relisten_worthy boolean DEFAULT false;
ALTER TABLE public.sermons
  ADD COLUMN IF NOT EXISTS entry_status text NOT NULL DEFAULT 'captured'
  CHECK (entry_status IN ('captured','processed','living'));

-- Refresh the PostgREST API schema cache
NOTIFY pgrst, 'reload schema';
