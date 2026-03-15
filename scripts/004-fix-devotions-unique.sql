-- Add unique constraint for user_id + date combination to support upsert
ALTER TABLE daily_devotions 
ADD CONSTRAINT daily_devotions_user_date_unique 
UNIQUE (user_id, date);
