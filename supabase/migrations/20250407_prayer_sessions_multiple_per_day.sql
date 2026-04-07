-- Allow multiple prayer_sessions per user per calendar day (same session_type).
-- Previously UNIQUE(user_id, date, session_type) blocked a second "morning" session.

ALTER TABLE prayer_sessions
  DROP CONSTRAINT IF EXISTS prayer_sessions_user_id_date_session_type_key;
