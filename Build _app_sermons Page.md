# Build /app/sermons Page
## Problem
Need a full sermon library management page with 3 views (Library, Uncategorized Queue, Top 80 Mastery), sermon detail/edit via side panel, and add/bulk-import functionality.
## Current State
* App follows pattern: server `page.tsx` fetches Supabase data → passes to `*-client.tsx` client component
* Theme: `#3C1E38` (deep purple text), `#A7C2D7` (soft blue accent), `#F9D57E` (gold accent), `#FDFCF9` (cream bg)
* Available UI components: Badge, Sheet (side panel), Tabs, Dialog, Button, Progress, Switch, Select, Input, Textarea
* Dashboard already links to `/app/sermons` and references `weeklySermonPrinciple`
* Nav in `components/app/app-shell.tsx` needs a Sermons entry
## Proposed Changes
### 1. Supabase Table SQL (`scripts/create-sermons-table.sql`)
* `sermons` table with columns: id (uuid), user_id, title, speaker (default 'Apostle Joshua Selman'), category (enum of 8 values including 'uncategorized'), resonance (1-5 int), source_url, tags (text[]), mastered (bool), applied (bool), mastery_summary, mastery_revelation, mastery_key_principle, mastery_life_areas (text[]), application_how, application_outcome, application_date, created_at, updated_at
* RLS policies for user-scoped access
* Index on user_id + category for fast filtering
### 2. Server Page (`app/app/sermons/page.tsx`)
* Follows existing pattern: auth check → fetch all sermons for user → pass to client
* Fetches sermons ordered by `created_at desc`
### 3. Client Component (`app/app/sermons/sermons-client.tsx`)
Single large client component (matching the pattern in prayers-client.tsx and scripture-client.tsx).
**3 Views via custom tab buttons** (matching the filter button style from prayers-client.tsx):
* **Library**: Searchable table/list with filters (category checkboxes, resonance range, mastered/applied toggles). Sort by date/resonance/title. Each row: title, speaker, category badge, resonance stars, mastered/applied icons. Click opens Sheet.
* **Uncategorized Queue**: Shows only category=uncategorized. Count banner. Batch mode: step through one at a time with 7 category buttons + resonance stars + Next. Progress bar.
* **Top 80 Mastery**: Filtered to resonance >= 4, sorted desc. Progress "X of 80 mastered". Cards with title, category, resonance, mastered badge, key principle, "Set as Weekly Application" button (updates `profiles.weekly_principle`).
**Sermon Detail/Edit** (Sheet, right side panel):
* All editable fields as described. Mastery Note section (conditional on mastered toggle). Application Note section (conditional on applied toggle). Auto-saves on field blur via Supabase update.
**Add New Sermon** (Dialog):
* Single add form + bulk import tab (textarea, one title per line, batch insert).
### 4. Nav Update (`components/app/app-shell.tsx`)
* Add `{ href: "/app/sermons", label: "Sermon Library", icon: Headphones }` between "Clarity Audios" and "Wisdom Log".
### Categories (7 + Uncategorized)
Will use these 8 values: `uncategorized`, `prayer`, `faith`, `the-holy-spirit`, `wisdom`, `purpose-and-destiny`, `relationships`, `prosperity`