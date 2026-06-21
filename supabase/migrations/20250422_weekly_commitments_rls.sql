-- Ensure INSERT/UPDATE on weekly commitments respect auth.uid() = user_id.

DROP POLICY IF EXISTS weekly_commitments_own ON weekly_commitments;
CREATE POLICY weekly_commitments_own ON weekly_commitments
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS weekly_commitment_logs_own ON weekly_commitment_logs;
CREATE POLICY weekly_commitment_logs_own ON weekly_commitment_logs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
