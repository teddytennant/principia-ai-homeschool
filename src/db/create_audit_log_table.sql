-- Migration: Create audit_log table for MGPD
CREATE TABLE IF NOT EXISTS audit_log (
  event_id     SERIAL PRIMARY KEY,
  learner_id   UUID,
  topic_id     TEXT,
  tier         SMALLINT CHECK (tier BETWEEN 0 AND 3),
  score        NUMERIC(3,2),
  ts           TIMESTAMPTZ DEFAULT now()
);
