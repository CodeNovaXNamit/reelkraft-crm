# Phase 1 Setup

Phase 1 connects Reelkraft OS to Google Workspace identity, Google Sheets storage, and Shared Drive metadata.

## Required Environment

```bash
AUTH_URL=http://localhost:3000
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=
GOOGLE_SHEETS_DATABASE_ID=
GOOGLE_SHARED_DRIVE_ID=
GOOGLE_WORKSPACE_ADMIN_EMAIL=
```

Generate `AUTH_SECRET` with:

```bash
npx auth secret
```

Google OAuth callback URLs:

```text
http://localhost:3000/api/auth/callback/google
https://crm.reelkraftmedia.online/api/auth/callback/google
```

## Workbook Setup

Create one Google Sheets workbook named `Reelkraft OS Database`, share it with the service account email, then run:

```bash
npm run sheets:ensure-schema
```

This creates or repairs Phase 1 tabs and header rows for `Employees`, `Invitations`, `AuditLogs`, `Notifications`, and `Settings`.

## Initial Team Seed

Set email overrides before seeding:

```bash
REELKRAFT_SHIVAM_EMAIL=shivam@reelkraftmedia.online
REELKRAFT_SAMRITI_EMAIL=samriti@reelkraftmedia.online
REELKRAFT_MEHAK_EMAIL=mehak@reelkraftmedia.online
REELKRAFT_NEHA_EMAIL=neha@reelkraftmedia.online
REELKRAFT_SHAHID_EMAIL=shahid@reelkraftmedia.online
REELKRAFT_KAMAL_EMAIL=kamal@reelkraftmedia.online
npm run seed:initial-team
```

The seed is idempotent by employee email.

## Local Testing Bypass

For local UI testing without Google OAuth, set:

```bash
REELKRAFT_AUTH_BYPASS=true
REELKRAFT_AUTH_BYPASS_EMAIL=testing.admin@reelkraftmedia.online
REELKRAFT_AUTH_BYPASS_EMPLOYEE_ID=emp_testing_admin
REELKRAFT_AUTH_BYPASS_ROLE=FOUNDER_ADMIN
```

The bypass is ignored when `NODE_ENV=production`.
