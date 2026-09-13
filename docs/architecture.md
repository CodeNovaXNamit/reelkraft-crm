# Architecture

Reelkraft OS is implemented as a separate CRM application. The public Reelkraft website is outside this repository boundary.

## Boundaries

UI and route code must depend on application services. Services depend on repository interfaces. V1 repositories will use Google Sheets adapters; a later PostgreSQL repository can satisfy the same interfaces.

```text
app/
components/
features/
services/
repositories/interfaces/
repositories/google-sheets/
lib/
types/
```

## Phase 0 Decisions

- The app is scaffolded with Next.js App Router and TypeScript strict mode.
- All planned navigation routes are registered through a shared dashboard catch-all route.
- Business records are not hardcoded in UI state.
- Integration behavior is represented by typed boundaries until real credentials and API access are configured in Phase 1.
- Auditability, permissions, date rules, and pagination have central utilities before feature work begins.

## Migration Readiness

Sheet row mapping must remain centralized in repository adapters. Business services should never depend on sheet row numbers or raw sheet payloads.
