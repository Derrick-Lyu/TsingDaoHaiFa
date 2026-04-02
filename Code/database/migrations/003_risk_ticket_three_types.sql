BEGIN;

ALTER TABLE terror_alerts
  ADD COLUMN IF NOT EXISTS ticket_type text NOT NULL DEFAULT 'warning_notice',
  ADD COLUMN IF NOT EXISTS trigger_source text,
  ADD COLUMN IF NOT EXISTS dispatch_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS feedback_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS recheck_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS ack_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS ticket_title text,
  ADD COLUMN IF NOT EXISTS ticket_reason text,
  ADD COLUMN IF NOT EXISTS ticket_content text,
  ADD COLUMN IF NOT EXISTS source_ref_type text,
  ADD COLUMN IF NOT EXISTS source_ref_id text,
  ADD COLUMN IF NOT EXISTS leader_instruction_flag boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS continuous_warning_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deadline_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_overdue boolean NOT NULL DEFAULT false;

UPDATE terror_alerts
SET
  ticket_type = COALESCE(ticket_type, 'warning_notice'),
  dispatch_status = COALESCE(dispatch_status, 'pending'),
  feedback_status = COALESCE(feedback_status, 'pending'),
  recheck_status = COALESCE(recheck_status, 'pending'),
  ack_status = COALESCE(ack_status, 'pending'),
  leader_instruction_flag = COALESCE(leader_instruction_flag, false),
  continuous_warning_count = COALESCE(continuous_warning_count, 0),
  is_overdue = COALESCE(is_overdue, false)
WHERE ticket_type IS NULL
   OR dispatch_status IS NULL
   OR feedback_status IS NULL
   OR recheck_status IS NULL
   OR ack_status IS NULL
   OR leader_instruction_flag IS NULL
   OR continuous_warning_count IS NULL
   OR is_overdue IS NULL;

CREATE TABLE IF NOT EXISTS terror_ticket_flow_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid NOT NULL REFERENCES terror_alerts(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  action_result text,
  action_comment text,
  operator_name text,
  operator_role text,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  extra_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_terror_alerts_ticket_type
  ON terror_alerts (ticket_type);

CREATE INDEX IF NOT EXISTS idx_terror_alerts_trigger_source
  ON terror_alerts (trigger_source);

CREATE INDEX IF NOT EXISTS idx_terror_alerts_dispatch_status
  ON terror_alerts (dispatch_status);

CREATE INDEX IF NOT EXISTS idx_terror_alerts_feedback_status
  ON terror_alerts (feedback_status);

CREATE INDEX IF NOT EXISTS idx_terror_alerts_recheck_status
  ON terror_alerts (recheck_status);

CREATE INDEX IF NOT EXISTS idx_terror_alerts_ack_status
  ON terror_alerts (ack_status);

CREATE INDEX IF NOT EXISTS idx_terror_alerts_deadline_at
  ON terror_alerts (deadline_at);

CREATE INDEX IF NOT EXISTS idx_terror_alerts_is_overdue
  ON terror_alerts (is_overdue);

CREATE INDEX IF NOT EXISTS idx_terror_ticket_flow_logs_alert_id
  ON terror_ticket_flow_logs (alert_id);

CREATE INDEX IF NOT EXISTS idx_terror_ticket_flow_logs_action_type
  ON terror_ticket_flow_logs (action_type);

CREATE INDEX IF NOT EXISTS idx_terror_ticket_flow_logs_created_at
  ON terror_ticket_flow_logs (created_at);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_terror_ticket_flow_logs_updated_at'
  ) THEN
    CREATE TRIGGER trg_terror_ticket_flow_logs_updated_at
    BEFORE UPDATE ON terror_ticket_flow_logs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

COMMIT;
