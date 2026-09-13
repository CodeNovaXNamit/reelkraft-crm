# Environment Variables

Copy `.env.example` to `.env.local` for local development.

Phase 0 validates environment shape without requiring production secrets. Phase 1 should make Google OAuth and Google API variables mandatory for protected runtime paths.

Secrets must not be exposed through client components or browser-editable settings.

## Phase 1

Auth.js uses `AUTH_SECRET`, `AUTH_URL`, `AUTH_GOOGLE_ID`, and `AUTH_GOOGLE_SECRET`. Google Sheets and Drive adapters use service-account variables and must run server-side only.
