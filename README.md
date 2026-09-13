# Reelkraft OS

Internal CRM and operations system for Reelkraft Media.

This project is a separate Next.js application for `crm.reelkraftmedia.online`. It does not modify or share code with the public website at `reelkraftmedia.online`.

## Phase

Current implementation: Phase 6 service/UI coverage - Authentication/RBAC foundation, CRM sales pipeline, client conversion, projects, tasks, workload, content production, finance, HR, calendar records, reports, and server-side integration failure logging.

Phase 7 post-V1 features from the master plan are not included because the plan explicitly requires separate approval for client portal, WhatsApp, AI assistant, forecasting, and advanced automation.

## Stack

- Next.js App Router
- TypeScript strict mode
- Tailwind CSS
- shadcn-style local UI primitives
- Auth.js Google Workspace OAuth
- Google Sheets API repository adapters
- Google Drive API metadata adapter
- Zod environment validation
- Vitest unit test runner

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

`npm run test:e2e` is wired for the future browser suite and currently runs a Phase 0 readiness smoke test.

## Phase 1 Setup

See `docs/phase-1-setup.md` for OAuth callback URLs, Google Sheets schema setup, Shared Drive configuration, and initial team seeding.

Useful setup commands:

```bash
npm run sheets:ensure-schema
npm run seed:initial-team
```

Local `.env.local` currently enables `REELKRAFT_AUTH_BYPASS=true` for testing the protected dashboard without Google OAuth. The bypass is ignored in production.

## Architecture

Business workflows must flow through service and repository boundaries:

```text
Route or server action
Service
Repository interface
Google Sheets repository implementation
Google Sheets API
```

The first implementation uses Google Sheets as the V1 data store. Repository interfaces are already separated so PostgreSQL can replace Sheets later without changing UI code.

## Security Guardrails

- No credentials are committed.
- `.env.example` contains placeholder names only.
- Dashboard routes require an active Auth.js session mapped to an active employee record.
- Server-side authorization helpers live in `lib/permissions`.
- Google Sheets and Drive modules run server-side and must not be imported into browser components.
- Secrets must remain in environment-managed systems, not settings screens.

## Production Blockers

The local code paths compile and pass automated tests, but the following checks require owner credentials and production access before the CRM can be called complete:

- Real Google OAuth sign-in with employee accounts.
- Live Google Sheets, Shared Drive, Gmail, Calendar, and Slack verification.
- Production Vercel project and `crm.reelkraftmedia.online` smoke test.
- Full browser E2E business journey from invite through lead, won deal, client onboarding, content, finance, search, reports, and unauthorized access attempts.
