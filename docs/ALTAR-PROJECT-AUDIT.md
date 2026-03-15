# ALTAR Project — Complete Inventory & Audit

Generated audit of routes, components, database, app pages, nav, data files, schema, env vars, and PWA/offline status.

---

## 1. ALL ROUTES (every page under /app and app root)

| Route | File path |
|-------|------------|
| `/` | `app/page.tsx` |
| `/about` | `app/about/page.tsx` |
| `/auth/error` | `app/auth/error/page.tsx` |
| `/features` | `app/features/page.tsx` |
| `/how-it-works` | `app/how-it-works/page.tsx` |
| `/login` | `app/login/page.tsx` |
| `/product` | `app/product/page.tsx` |
| `/signup` | `app/signup/page.tsx` |
| `/signup/success` | `app/signup/success/page.tsx` |
| `/testimonials` | `app/testimonials/page.tsx` |
| `/app` | `app/app/page.tsx` (redirects to `/app/dashboard`) |
| `/app/dashboard` | `app/app/dashboard/page.tsx` |
| `/app/pulse` | `app/app/pulse/page.tsx` |
| `/app/tasks` | `app/app/tasks/page.tsx` |
| `/app/prayer` | `app/app/prayer/page.tsx` |
| `/app/prayers` | `app/app/prayers/page.tsx` |
| `/app/declarations` | `app/app/declarations/page.tsx` |
| `/app/downloads` | `app/app/downloads/page.tsx` |
| `/app/goals` | `app/app/goals/page.tsx` |
| `/app/sermons` | `app/app/sermons/page.tsx` |
| `/app/journal` | `app/app/journal/page.tsx` |
| `/app/settings` | `app/app/settings/page.tsx` |
| `/app/prayer-history` | `app/app/prayer-history/page.tsx` |

Also: `app/loading.tsx` (loading UI).

---

## 2. ALL COMPONENTS (grouped by folder)

### `components/app/`
- **app-shell.tsx** — Sidebar + header layout, nav, sign out
- **quick-capture-fab.tsx** — Floating quick-capture for divine downloads
- **layout-wrapper.tsx** — Conditionally shows Navbar+Footer on marketing routes only

### `components/app/pulse/`
- phase-card.tsx  
- phase1-setup.tsx, phase2-measure.tsx, phase3-review.tsx, phase4-learn.tsx, phase5-plan.tsx, phase6-close.tsx  
- session-banner.tsx  
- session-history.tsx  
- weekly-audit-grid.tsx  

### `components/app/sacred-focus/`
- activities-list.tsx, activity-detail.tsx, activity-form.tsx  
- books-resources.tsx  
- fruit-recording.tsx  
- journal.tsx, journal-entry-form.tsx  
- season-overview.tsx  
- sub-challenges.tsx  
- types.ts  

### `components/app/declarations/`
- counter-ring.tsx  
- edit-flow.tsx  
- first-time.tsx  
- history.tsx  
- recitation-mode.tsx  
- view-all.tsx  
- types.ts  

### `components/` (root-level)
- a-b-test-wrapper.tsx, analytics-wrapper.tsx  
- chrome-extension-blocker.tsx, conversion-optimizer.tsx  
- cookie-consent.tsx  
- email-signup-section.tsx, error-boundary.tsx, exit-intent-modal.tsx  
- extension-conflict-handler.tsx  
- faq-section.tsx, features-grid.tsx, flow-section.tsx  
- footer.tsx  
- hero-section.tsx  
- lazy-image.tsx, loading-skeleton.tsx, logo-variations.tsx  
- metamask-error-handler.tsx, micro-interactions.tsx  
- navbar.tsx  
- performance-monitor.tsx  
- social-proof.tsx, success-message.tsx  
- theme-provider.tsx  
- trust-signals.tsx  
- urgency-banner.tsx  

### `components/features/`
- accessibility-enhancements.tsx, advanced-analytics.tsx  
- ai-content-generation.tsx, ai-insights-dashboard.tsx, ai-prayer-guidance.tsx, ai-spiritual-guidance.tsx  
- basic-dashboard.tsx  
- collaborative-editing.tsx, custom-themes.tsx  
- dark-mode.tsx  
- enhanced-features-showcase.tsx  
- features-categories.tsx, features-comparison.tsx, features-cta.tsx  
- features-hero.tsx, features-navigation.tsx, features-showcase.tsx, features-testimonials.tsx  
- interactive-feature-demo.tsx  
- mobile-comparison-table.tsx  
- offline-support.tsx (placeholder)  
- performance-monitor.tsx  
- real-time-social-proof.tsx, real-time-updates.tsx  
- scenario-based-testimonials.tsx  
- spiritual-assessment-quiz.tsx  

### `components/product/`
- product-comparison.tsx, product-cta.tsx, product-demo.tsx  
- product-features.tsx, product-hero.tsx  
- product-objection-handler.tsx, product-pricing.tsx  
- product-social-proof.tsx, product-testimonials.tsx  

### `components/testimonials/`
- featured-testimonials.tsx  
- scripture-testimonials.tsx, seasonal-testimonials.tsx  
- social-testimonials.tsx  
- sticky-cta.tsx  
- testimonial-categories.tsx, testimonial-map.tsx, testimonial-stats.tsx  
- testimonial-submission.tsx, testimonial-wall.tsx  
- testimonials-cta.tsx, testimonials-hero.tsx  
- video-testimonials.tsx, voice-testimonials.tsx  

### `components/ui/` (shadcn-style primitives)
- accordion, alert, alert-dialog, aspect-ratio, avatar  
- badge, breadcrumb, button, button-group  
- calendar, card, carousel, chart, checkbox, collapsible, command, context-menu  
- dialog, drawer, dropdown-menu  
- empty  
- field, form  
- hover-card  
- input, input-group, input-otp, item  
- kbd  
- label  
- menubar  
- navigation-menu  
- pagination, popover, progress  
- radio-group, resizable  
- scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, spinner, switch  
- table, tabs, textarea, toast, toaster, toggle, toggle-group, tooltip  
- use-mobile.tsx, use-toast.ts  

---

## 3. ALL DATABASE TABLES (referenced in codebase)

**From migrations (supabase/migrations/):**
- **wisdom_entries** — Wisdom Log entries (entry_type, title, content, scripture, life_areas, etc.)
- **aligned_decisions** — 5-step decision cards (steps 1–5, outcome, category)
- **prayer_sessions** — One row per prayer session (date, start/end, duration, journal_entry, etc.)
- **saved_prayers** — User prayer collection (title, content, category)
- **warfare_scriptures** — Battle-category scriptures
- **prayer_requests** — Prayer requests (request, status, category)
- **daily_focus** — Top 3 focus per day (focus_1/2/3, goal_1/2/3)
- **pulse_sessions** — Sunday planning session (phases, phase4/5/6 text/arrays, session_quality, phase3_pulse_check_id)

**From scripts (scripts/*.sql) and code references:**
- **pulse_checks** — Weekly pulse (g1_prayer … g7_content, g3_dominion, overall_reflection) — rebuild-goals-tables.sql
- **goal_notes** — Per-goal target_text, reflection — create-goals-tables.sql
- **declarations** — User declarations (content, scripture_reference, area, target_count) — create-declarations-tables.sql
- **declaration_logs** — Daily counter per declaration (declaration_id, date, current_count, target_count, completed)
- **divine_downloads** — Quick-capture downloads (content, category, source, life_areas) — create-downloads-tables.sql, 003
- **spiritual_insights** — Longer contemplative entries (content, source, shareable)
- **sermons** — Sermon library (title, speaker, category, resonance, mastered, applied, mastery_*, application_*) — create-sermons-table.sql
- **profiles** — User profile (weekly_principle, etc.) — 002-dominion-updates.sql
- **daily_devotions** — Daily log (prayer_complete, declarations_complete, gratitude_complete, sermons_today, energy_score, gratitude_items) — 002, 004, 005
- **spiritual_activities** — Sacred Focus activities — create-sacred-focus-tables.sql
- **activity_journal_entries** — Activity journal entries
- **activity_sub_challenges** — Sub-challenges
- **sub_challenge_logs** — Logs for sub-challenges
- **activity_fruits** — Fruits recorded
- **prayers** — Intercession/prayers list (used by app/prayers; distinct from prayer_requests)

**Summary list (table names only):**  
activity_fruits, activity_journal_entries, activity_sub_challenges, aligned_decisions, declaration_logs, declarations, daily_devotions, daily_focus, divine_downloads, goal_notes, profiles, pulse_checks, pulse_sessions, prayer_requests, prayer_sessions, prayers, saved_prayers, sermons, spiritual_activities, spiritual_insights, sub_challenge_logs, warfare_scriptures, wisdom_entries

---

## 4. EACH APP PAGE (route, title, server fetch, client, functional vs placeholder, tables)

| Route | Title | Server fetches | Client renders | Functional vs placeholder | Tables read/write |
|-------|--------|----------------|----------------|----------------------------|-------------------|
| **/app/dashboard** | DOMINION \| ALTAR | weekly devotions, divine_downloads count, sermons this week, today daily_devotions, profiles.weekly_principle, today prayer_sessions, today pulse_sessions | Scripture/declarations banner, 4 stat cards (Prayer, Downloads, Sermons, DOMINION), Sunday gold card, today log (prayer, declarations, gratitude, sermons, energy), intercession + prayer areas, quarter progress, quick capture | **Functional** | Read: daily_devotions, divine_downloads, profiles, prayer_sessions, pulse_sessions. Write: daily_devotions, divine_downloads |
| **/app/pulse** | Sunday Pulse \| ALTAR | today pulse_sessions, past pulse_sessions, last 7d daily_devotions, prayer_sessions by date, divine_downloads, declaration_logs summary, this week pulse_checks, declarations, last week pulse_sessions.phase4_time_analysis, next week daily_focus | Banner (Sunday vs not), session timer, 6 phase cards (setup…close), session history (streak, list) | **Functional** | Read: pulse_sessions, daily_devotions, prayer_sessions, divine_downloads, declaration_logs, pulse_checks, declarations, daily_focus. Write: pulse_sessions, daily_devotions, pulse_checks, daily_focus |
| **/app/tasks** | (Sacred Focus) | spiritual_activities, activity_journal_entries, activity_sub_challenges, sub_challenge_logs, activity_fruits | Sacred Focus client (activities, journal, sub-challenges, etc.) | **Functional** (depends on script tables existing) | Read: spiritual_activities, activity_journal_entries, activity_sub_challenges, sub_challenge_logs, activity_fruits |
| **/app/prayer** | (Prayer) | prayer_sessions (today + recent), saved_prayers, warfare_scriptures, prayer_requests, declarations, declaration_logs, daily_devotions (today), spiritual_activities | 4 tabs: Prayer Mode, Journal, Toolkit, Requests | **Functional** | Read: prayer_sessions, saved_prayers, warfare_scriptures, prayer_requests, declarations, declaration_logs, daily_devotions, spiritual_activities. Write: prayer_sessions, prayer_requests, wisdom_entries (testimony) |
| **/app/prayers** | (Intercession) | prayers | List of prayers, add/answer/delete | **Functional** | Read/Write: prayers |
| **/app/declarations** | Declarations \| ALTAR | declarations (active), declaration_logs (today) | Declarations client (recitation, counter, view-all, history) | **Functional** | Read: declarations, declaration_logs. Write: (declaration_logs via client) |
| **/app/downloads** | (Divine Downloads) | divine_downloads, spiritual_insights, sermons | List, filters, create/edit/delete downloads; insights; link to sermons | **Functional** | Read: divine_downloads, spiritual_insights, sermons. Write: divine_downloads, spiritual_insights |
| **/app/goals** | Spiritual Goals \| ALTAR | pulse_checks, goal_notes, daily_devotions (quarter + this week) | 7 goals, progress, pulse check flow (Yes/No/Blocked, G3 scale), history | **Functional** | Read: pulse_checks, goal_notes, daily_devotions. Write: goal_notes, pulse_checks |
| **/app/sermons** | (Sermon Library) | sermons | List, add/edit/delete, categories, weekly_principle | **Functional** | Read: sermons. Write: sermons, profiles.weekly_principle |
| **/app/journal** | (Wisdom Log) | wisdom_entries, aligned_decisions, spiritual_activities | 3 tabs: Wisdom Entries, Decisions, Insights Dashboard; Log Wisdom modal, Decision Flow form | **Functional** | Read: wisdom_entries, aligned_decisions, spiritual_activities. Write: wisdom_entries, aligned_decisions |
| **/app/settings** | Settings \| ALTAR | profiles | Profile form (display name, etc.) | **Functional** | Read/Write: profiles |
| **/app/prayer-history** | (Prayer History) | daily_devotions (last 30) | PrayerHistoryClient (list of logs) | **Functional** | Read: daily_devotions |

---

## 5. SIDEBAR NAV (from app-shell.tsx)

```ts
const navItems = [
  { href: "/app/dashboard", label: "DOMINION", icon: Crown },
  { href: "/app/pulse", label: "Sunday Pulse", icon: CalendarCheck, sundayHighlight: true },
  { href: "/app/tasks", label: "Sacred Focus", icon: Target },
  { href: "/app/prayer", label: "Prayer", icon: Flame },
  { href: "/app/prayers", label: "Intercession", icon: Heart },
  { href: "/app/declarations", label: "Declarations", icon: ScrollText },
  { href: "/app/sermons", label: "Sermon Library", icon: BookOpen },
  { href: "/app/downloads", label: "Divine Downloads", icon: Zap },
  { href: "/app/journal", label: "Wisdom Log", icon: Lightbulb },
  { href: "/app/settings", label: "Settings", icon: Settings },
]
```

Icons: Crown, CalendarCheck, Target, Flame, Heart, ScrollText, BookOpen, Zap, Lightbulb, Settings (lucide-react).

---

## 6. DATA FILES (lib/data and similar)

| Path | Contents |
|------|----------|
| **lib/data/dominion.ts** | dominionDeclarations (10), intercessionRotation (Mon–Sun), prayerAreas (10), GOALS (7 with pulseQuestion, dbField, kr10x/5x/2x, notNow), getTodayDeclaration, getTodayIntercession, getTodayPrayerAreas, isSunday, getQuarterProgress, dailyVerses, getTodayVerse, pulseQuestions, spiritualGoals |
| **lib/data/devotions.ts** | dailyVerses, prayerPrompts, gratitudePrompts, getTodayVerse, getTodayPrayerPrompt, getGratitudePrompt |
| **lib/data/scriptures.ts** | scriptureCollections (peace, strength, etc.) with verses |
| **lib/pulse.ts** | PHASES, PulseSessionRow type, OPENING_PRAYER, CLOSING_PRAYER, SESSION_QUALITY_LABELS, CONSTRAINT_CHIPS, TIME_CATEGORIES |
| **lib/prayer.ts** | SessionType, MoodBefore/After, SavedPrayerCategory, WarfareCategory, RequestCategory/Status/Priority, PrayerSession and related types, constants |
| **lib/wisdom-log.ts** | WisdomEntryType, DecisionCategory, WisdomEntry, AlignedDecision, entry type config (cardBg, iconBg, iconColor), life areas, goal codes |

---

## 7. CURRENT DATABASE SCHEMA (tables and columns)

**From migrations + scripts. (Auth table `auth.users` and any `profiles` columns from 002 are assumed.)**

### wisdom_entries
- id (uuid PK), user_id (FK auth.users), entry_type (text), title, content, scripture_reference, scripture_text, sources, life_areas (text[]), connected_goal_code, connected_activity_id, shareable, is_highlight, date, created_at, updated_at

### aligned_decisions
- id (uuid PK), user_id (FK), wisdom_entry_id (FK wisdom_entries), date, description, context, category (text), step1_prayed, step1_note, step2_scripture, step2_note, step3_counsel, step3_who, step3_note, step4_peace, step4_note, step5_dominion, aligned, outcome, outcome_date, outcome_rating, lesson_learned, created_at, updated_at

### prayer_sessions
- id, user_id, date, start_time, end_time, duration_minutes, session_type, quality_rating, presence_level, focus_areas_covered, intercession_theme_completed, declarations_completed, tongues_minutes, worship_included, warfare_engaged, journal_entry, breakthroughs, what_god_said, prayer_requests_prayed, scripture_used, mood_before, mood_after, notes, connected_activity_id, created_at, updated_at; UNIQUE(user_id, date, session_type)

### saved_prayers
- id, user_id, title, content, category, scripture_references, tags, source, is_favorite, use_count, last_used_date, display_order, active, created_at, updated_at

### warfare_scriptures
- id, user_id, battle_category, scripture_reference, scripture_text, how_to_pray_it, personal_note, is_tested, test_outcome, display_order, created_at

### prayer_requests
- id, user_id, request, category, scripture_anchor, status, date_started, date_answered, answer_note, priority, created_at, updated_at

### daily_focus
- id, user_id, date, focus_1, focus_2, focus_3, goal_1, goal_2, goal_3, created_at, updated_at; UNIQUE(user_id, date)

### pulse_sessions
- id, user_id, date, quarter_code, week_number, started_at, completed_at, phases_completed (text[]), total_duration_minutes, phase1_completed, phase2_backfill_count, phase3_pulse_check_id (FK pulse_checks), phase4_time_analysis, phase4_constraint_changes, phase4_declaration_reviewed, phase5_weekly_plan_notes, phase5_next_week_focus (text[]), phase6_monday_top3 (text[]), overall_session_notes, session_quality (1–5), created_at, updated_at; UNIQUE(user_id, date)

### pulse_checks
- id, user_id, week_number, date, quarter_code, g1_prayer, g1_note, g2_sermons, g2_note, g3_dominion, g3_note, g4_warfare, g4_note, g5_decisions, g5_note, g6_community, g6_note, g7_content, g7_note, overall_reflection, created_at; UNIQUE(user_id, quarter_code, week_number)

### goal_notes
- id, user_id, goal_id, target_text, reflection, updated_at; UNIQUE(user_id, goal_id)

### declarations
- id, user_id, display_order, area, content, scripture_reference, scripture_text, target_count, active, created_at, updated_at

### declaration_logs
- id, user_id, declaration_id (FK declarations), date, current_count, target_count, completed, created_at, updated_at; UNIQUE(user_id, declaration_id, date)

### divine_downloads
- id, user_id, content, category, source, life_areas, action_taken, action_note, became_testimony, testimony_note, shareable, linked_sermon_id (FK sermons), created_at

### spiritual_insights
- id, user_id, content, source, shareable, format_tag, created_at

### sermons
- id, user_id, title, speaker, category, resonance, source_url, tags, mastered, applied, mastery_summary, mastery_revelation, mastery_key_principle, mastery_life_areas, application_how, application_outcome, application_date, created_at, updated_at

### profiles
- (id = user id), weekly_principle (from 002)

### daily_devotions
- user_id, date (UNIQUE), prayer_complete, declarations_complete, gratitude_complete, sermons_today, energy_score, gratitude_items (from 002, 004, 005)

### spiritual_activities
- id, user_id, title, type, organizer, description, start_date, end_date, is_recurring, recurrence_pattern, status, tags, books_resources, overall_reflection, created_at, updated_at

### activity_journal_entries
- id, user_id, activity_id (FK spiritual_activities), entry_type, content, scripture_reference, speaker, is_highlight, date, created_at

### activity_sub_challenges
- id, user_id, activity_id, title, description, target_type, target_value, target_unit, start_date, …

### sub_challenge_logs
- (per script)

### activity_fruits
- (per script)

### prayers
- Referenced by app/prayers (user_id, status, answer_notes, etc.); schema not in migrations reviewed — likely in a script or Supabase default.

---

## 8. ENVIRONMENT VARIABLES (names only)

- **NEXT_PUBLIC_SUPABASE_URL**
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**
- **NEXT_PUBLIC_GA_ID** (optional; analytics)

---

## 9. PWA / OFFLINE / CACHING

- **PWA manifest:** None in project root (no `manifest.json` or `manifest.webmanifest`).
- **Service worker:** No app-level service worker in source (only Next/build or node_modules).
- **Offline/caching:** No app-level caching or offline strategy found in project source.
- **Component:** `components/features/offline-support.tsx` exists but is a **placeholder** (“Offline support component placeholder”); not wired to any real offline or caching logic.

---

*End of audit.*
