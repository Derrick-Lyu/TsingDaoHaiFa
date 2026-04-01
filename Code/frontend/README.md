# Frontend

This package contains the Qingdao HaiFa risk dashboard frontend. It is the migrated React 19 + Vite application pulled from the original prototype repository.

## Responsibilities

- Render the dashboard UI and data visualizations
- Own frontend assets, styles, and page composition
- Call backend APIs through `VITE_API_BASE_URL`

## Local Development

```bash
npm install
npm run dev
```

## Frontend Guardrails

Use these commands before merging frontend changes:

```bash
npm run lint
npm run build:guarded
```

`build:guarded` runs the production build and then enforces bundle budgets for:

- the primary entry bundle
- the React vendor chunk
- the charting chunk
- route-level page chunks

If a new dependency or page causes a budget failure, fix the loading strategy instead of raising the budget by default.

## Performance Policy

Keep the client demo path from turning into a future tech blocker:

1. Default to route-level lazy loading for new pages and operator-only surfaces.
2. Keep heavy libraries isolated by domain; charting, admin/data maintenance, and document tooling should not inflate the primary demo entry bundle.
3. Treat bundle-budget failures as design feedback, not as a release-time cleanup task.
4. When adding a dependency, document which route pays for it and whether it loads eagerly or lazily.

## Docker

From the [`Code/README.md`](../README.md) workspace root:

```bash
docker compose up --build frontend
```

The container exposes the Vite dev server on port `5173`.

## Environment

Copy `.env.example` to `.env` when needed.

```bash
VITE_API_BASE_URL=http://localhost:8000
```
