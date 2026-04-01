-- Demo schema for the fund safety / terror risk workflow.
-- Assumes `uuid-ossp` and `pgcrypto` are already available from init scripts.

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS fund_safety_topic_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_code text NOT NULL UNIQUE,
  topic_name text NOT NULL,
  secondary_topic_name text NOT NULL,
  summary_title text NOT NULL,
  core_metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  risk_conclusion text NOT NULL,
  risk_level text NOT NULL DEFAULT 'low',
  is_clickable boolean NOT NULL DEFAULT false,
  target_page_key text,
  data_snapshot_date date,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS terror_blacklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blacklist_code text NOT NULL UNIQUE,
  blacklist_name text NOT NULL,
  subject_name text NOT NULL,
  subject_type text NOT NULL DEFAULT 'organization',
  match_keywords text[] NOT NULL DEFAULT '{}'::text[],
  risk_level text NOT NULL DEFAULT 'high',
  status text NOT NULL DEFAULT 'enabled',
  source_system text,
  effective_from date,
  effective_to date,
  notes text,
  created_by text,
  updated_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS terror_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_code text NOT NULL UNIQUE,
  rule_name text NOT NULL,
  rule_category text NOT NULL,
  rule_description text NOT NULL,
  risk_level text NOT NULL DEFAULT 'warning',
  enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_by text,
  updated_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS terror_rule_params (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid NOT NULL REFERENCES terror_rules(id) ON DELETE CASCADE,
  param_key text NOT NULL,
  param_label text NOT NULL,
  param_value text NOT NULL,
  value_type text NOT NULL DEFAULT 'text',
  unit text,
  editable boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (rule_id, param_key)
);

CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_no text NOT NULL UNIQUE,
  transaction_date date NOT NULL,
  batch_no text,
  member_unit_code text,
  member_unit_name text NOT NULL,
  payer_name text NOT NULL,
  payer_account text,
  payee_name text NOT NULL,
  payee_account text,
  amount numeric(18, 2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'CNY',
  payee_type text NOT NULL DEFAULT 'organization',
  business_scenario text NOT NULL,
  transaction_count integer NOT NULL DEFAULT 1,
  account_last_active_date date,
  is_dormant_account boolean NOT NULL DEFAULT false,
  source_file_name text,
  source_row_no integer,
  extra_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS terror_detection_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_no text NOT NULL UNIQUE,
  job_status text NOT NULL DEFAULT 'pending',
  triggered_by text,
  started_at timestamptz,
  finished_at timestamptz,
  input_snapshot_at timestamptz,
  transaction_count integer NOT NULL DEFAULT 0,
  matched_count integer NOT NULL DEFAULT 0,
  high_risk_count integer NOT NULL DEFAULT 0,
  warning_count integer NOT NULL DEFAULT 0,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS terror_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_no text NOT NULL UNIQUE,
  job_id uuid NOT NULL REFERENCES terror_detection_jobs(id) ON DELETE CASCADE,
  rule_id uuid NOT NULL REFERENCES terror_rules(id),
  rule_code text NOT NULL,
  rule_name text NOT NULL,
  risk_level text NOT NULL,
  alert_status text NOT NULL DEFAULT 'open',
  review_status text NOT NULL DEFAULT 'pending',
  member_unit_code text,
  member_unit_name text NOT NULL,
  payer_name text,
  payer_account text,
  payee_name text,
  payee_account text,
  transaction_date date,
  matched_amount numeric(18, 2) NOT NULL DEFAULT 0,
  matched_count integer NOT NULL DEFAULT 0,
  evidence_count integer NOT NULL DEFAULT 0,
  latest_evidence_summary text,
  alert_summary text NOT NULL,
  extra_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS terror_alert_evidences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid NOT NULL REFERENCES terror_alerts(id) ON DELETE CASCADE,
  evidence_type text NOT NULL,
  evidence_title text NOT NULL,
  evidence_detail text NOT NULL,
  evidence_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  evidence_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS terror_alert_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid NOT NULL UNIQUE REFERENCES terror_alerts(id) ON DELETE CASCADE,
  review_status text NOT NULL DEFAULT 'pending',
  reviewer_name text,
  review_result text,
  review_comment text,
  reviewed_at timestamptz,
  created_by text,
  updated_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_fund_safety_topic_summaries_updated_at'
  ) THEN
    CREATE TRIGGER trg_fund_safety_topic_summaries_updated_at
    BEFORE UPDATE ON fund_safety_topic_summaries
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_terror_blacklist_updated_at'
  ) THEN
    CREATE TRIGGER trg_terror_blacklist_updated_at
    BEFORE UPDATE ON terror_blacklist
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_terror_rules_updated_at'
  ) THEN
    CREATE TRIGGER trg_terror_rules_updated_at
    BEFORE UPDATE ON terror_rules
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_terror_rule_params_updated_at'
  ) THEN
    CREATE TRIGGER trg_terror_rule_params_updated_at
    BEFORE UPDATE ON terror_rule_params
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_payment_transactions_updated_at'
  ) THEN
    CREATE TRIGGER trg_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_terror_detection_jobs_updated_at'
  ) THEN
    CREATE TRIGGER trg_terror_detection_jobs_updated_at
    BEFORE UPDATE ON terror_detection_jobs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_terror_alerts_updated_at'
  ) THEN
    CREATE TRIGGER trg_terror_alerts_updated_at
    BEFORE UPDATE ON terror_alerts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_terror_alert_evidences_updated_at'
  ) THEN
    CREATE TRIGGER trg_terror_alert_evidences_updated_at
    BEFORE UPDATE ON terror_alert_evidences
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_terror_alert_reviews_updated_at'
  ) THEN
    CREATE TRIGGER trg_terror_alert_reviews_updated_at
    BEFORE UPDATE ON terror_alert_reviews
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_fund_safety_topic_summaries_order
  ON fund_safety_topic_summaries (display_order);

CREATE INDEX IF NOT EXISTS idx_terror_blacklist_status
  ON terror_blacklist (status);

CREATE INDEX IF NOT EXISTS idx_terror_rules_category
  ON terror_rules (rule_category);

CREATE INDEX IF NOT EXISTS idx_terror_rule_params_rule_id
  ON terror_rule_params (rule_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_member_unit
  ON payment_transactions (member_unit_name);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_date
  ON payment_transactions (transaction_date);

CREATE INDEX IF NOT EXISTS idx_terror_detection_jobs_status
  ON terror_detection_jobs (job_status);

CREATE INDEX IF NOT EXISTS idx_terror_alerts_job_id
  ON terror_alerts (job_id);

CREATE INDEX IF NOT EXISTS idx_terror_alerts_rule_code
  ON terror_alerts (rule_code);

CREATE INDEX IF NOT EXISTS idx_terror_alert_evidences_alert_id
  ON terror_alert_evidences (alert_id);

