ALTER TABLE terror_alert_reviews
ADD COLUMN IF NOT EXISTS assigned_reviewer_name text,
ADD COLUMN IF NOT EXISTS assigned_at timestamptz,
ADD COLUMN IF NOT EXISTS assignment_status text NOT NULL DEFAULT 'unassigned';
