-- Notification preferences on profiles (used when PWA/service worker is implemented)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notification_preferences jsonb
DEFAULT '{
  "prayer_reminder": {"enabled": false, "time": "02:50"},
  "declaration_reminder": {"enabled": false, "time": "05:30"},
  "sunday_pulse_reminder": {"enabled": false, "time": "14:00"},
  "sub_challenge_reminder": {"enabled": false, "time": "20:00"},
  "gratitude_reminder": {"enabled": false, "time": "21:00"}
}'::jsonb;
