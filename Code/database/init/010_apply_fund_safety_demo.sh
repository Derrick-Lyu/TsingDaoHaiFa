#!/bin/sh
set -eu

psql -v ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  -f /workspace-database/migrations/001_fund_safety_demo_schema.sql

psql -v ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  -f /workspace-database/seeds/001_fund_safety_demo_seed.sql
