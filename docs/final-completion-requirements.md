# Reelkraft OS Final Completion Requirements

This document lists what is still needed to complete Reelkraft OS as a production-ready CRM, beyond the local implementation already present in this repository.

## Current Local Status

The codebase currently includes:

- Next.js CRM application separated from the public website.
- Auth/RBAC foundation with Google Workspace OAuth support.
- Employee, invitation, role, permission, and session services.
- Google Sheets repository adapters behind repository interfaces.
- Google Drive metadata gateway.
- Leads, deals, pipeline movement, pipeline audit, and won-deal conversion.
- Client workspaces, projects, tasks, workload, and in-app notifications.
- Content production, content calendar, approvals, finance, HR, calendar records, reports, and integration failure logging.
- Server-side validation and permission checks for implemented business services.
- Local UI pass with improved shell, tables, cards, forms, and mobile navigation.

Recent local verification:

- `npm run lint`: passing.
- `npm run typecheck`: passing.
- `npm run test`: passing.
- `npm run test:e2e`: smoke suite passing.
- `npm run build`: passing.

## Important Non-Completion Statement

The CRM should not be considered complete for daily production use yet.

The remaining blockers are mostly live credentials, production infrastructure, external-service verification, full browser E2E coverage, security hardening, and owner sign-off.

## Access Needed From Owner

The following access is required to finish verification and production launch:

- Google Workspace admin or authorized technical admin access for `reelkraftmedia.online`.
- Google OAuth client access for production and local callback configuration.
- Google Cloud project access with Sheets, Drive, Gmail, and Calendar APIs enabled.
- Service account or delegated Workspace credentials for backend Google integrations.
- Access to the production Google Sheet used as the CRM database.
- Access to the `REELKRAFT MEDIA` Shared Drive.
- Slack workspace admin/app access.
- Vercel project access for the CRM app.
- DNS access for `crm.reelkraftmedia.online`.
- GitHub repository access for the CRM repo.
- Real founder/admin Google account for final owner testing.
- At least one real employee Google account for employee-flow testing.

## Environment Variables Needed

Production and local verification require real values for:

- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `AUTH_TRUST_HOST`
- `NEXTAUTH_URL` or Auth.js equivalent deployment URL configuration
- `GOOGLE_SHEETS_SPREADSHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `GOOGLE_DRIVE_ROOT_FOLDER_ID`
- `GOOGLE_SHARED_DRIVE_ID`
- `GOOGLE_CALENDAR_ID`
- `GOOGLE_WORKSPACE_DELEGATED_USER`
- `SLACK_BOT_TOKEN`
- `SLACK_SIGNING_SECRET`
- Slack channel IDs for sales, announcements, deadlines, approvals, and urgent issues

All secrets must be stored in environment-managed systems, not committed to the repo.

## Google Workspace Work Needed

To complete Google Workspace integration:

- Confirm Google Workspace is active for `reelkraftmedia.online`.
- Confirm all employee accounts use the correct domain.
- Configure Google OAuth consent screen.
- Configure authorized redirect URIs for local and production.
- Verify real Google sign-in for founder/admin account.
- Verify unauthorized Google account rejection.
- Verify inactive employee rejection.
- Verify session security settings in production.
- Verify logout behavior in production.

## Google Sheets Work Needed

To complete Sheets V1 database readiness:

- Create or confirm the production CRM spreadsheet.
- Run schema creation/validation against the production spreadsheet.
- Verify all required sheets exist:
  - Employees
  - Invitations
  - Leads
  - Deals
  - PipelineMovements
  - Clients
  - ClientContacts
  - Projects
  - Tasks
  - Content
  - Meetings
  - Finance
  - Payments
  - AuditLogs
  - Notifications
  - Activity
  - Settings
  - RolePermissions
- Seed the initial founder/admin employee.
- Verify stable IDs are used, not sheet row numbers.
- Verify corrupt row handling.
- Verify duplicate ID detection behavior.
- Verify pagination on large lists.
- Verify unauthorized users cannot receive raw sheet data.
- Load realistic test data and confirm list/detail pages work.

## Google Drive Work Needed

To complete Drive integration:

- Confirm the `REELKRAFT MEDIA` Shared Drive exists.
- Confirm the root folder ID.
- Confirm required top-level folders:
  - `01 ADMIN`
  - `02 SALES`
  - `03 CLIENTS`
  - `04 CONTENT`
  - `05 FINANCE`
  - `06 MARKETING`
  - `07 INTERNAL`
  - `99 ARCHIVE`
- Verify server-side folder metadata reads.
- Verify file metadata reads.
- Verify restricted employees do not automatically gain all Drive file access.
- Complete live client folder creation for won-deal conversion.
- Verify client folder idempotency.
- Verify large media is linked in Drive rather than proxied through the app.

## Slack Work Needed

To complete Slack integration:

- Create/configure Slack app.
- Store Slack bot token and signing secret in production env.
- Configure required Slack channels:
  - Sales/new leads.
  - Announcements/deal won.
  - Deadlines/task overdue.
  - Approvals/client approval required.
  - Urgent/urgent issues.
- Verify real message delivery.
- Verify Slack failures are logged.
- Verify Slack failure does not undo successful CRM writes.

## Gmail / Workspace Email Work Needed

To complete Gmail or Workspace email:

- Configure delegated sender or service account flow.
- Verify employee invitation email delivery.
- Verify meeting email delivery if included in V1.
- Verify operational notification email delivery.
- Verify email failure does not corrupt CRM data.
- Confirm no unnecessary email-marketing system is added.

## Google Calendar Work Needed

To complete Calendar:

- Configure production calendar ID.
- Verify real Google Calendar event creation.
- Save Google event ID to the `Meetings` sheet.
- Verify retry does not create duplicate events.
- Verify timezone behavior for India/Reelkraft business timezone.
- Verify upcoming meetings display correctly.
- Verify event links to client, project, and task where applicable.

## Full Business E2E Journey Needed

The CRM is complete only after this journey passes in a real browser against configured services:

1. Founder/admin signs in with Google.
2. Admin invites employee.
3. Employee accepts invitation.
4. Employee signs in.
5. Lead is created.
6. Linked deal appears in pipeline.
7. Deal moves through required stages.
8. Every stage movement appears in pipeline audit.
9. Deal becomes `WON`.
10. WON deal converts to client exactly once.
11. Client Drive structure is created.
12. Onboarding project is created.
13. Onboarding tasks are created.
14. Task is assigned to employee.
15. Employee sees only assigned/authorized task.
16. Task workflow moves through review/completion.
17. Content item is created.
18. Internal review works.
19. Revision flow works.
20. Approval works.
21. Schedule/publish works.
22. Drive resource links work.
23. Google Calendar event is created and linked.
24. Finance record is created.
25. Payment/outstanding state works.
26. Global search finds only authorized data.
27. Reports reconcile with source records.
28. Audit log shows critical activity.
29. Slack notification arrives.
30. Gmail notification arrives where configured.
31. Unauthorized employee cannot view finance.
32. Unauthorized employee cannot view another employee restricted work.
33. Mobile navigation works through critical flow.

## Negative / Security E2E Needed

Security completion requires active negative tests:

- Unauthenticated dashboard request fails.
- Unauthenticated mutation fails.
- Unauthorized finance read fails.
- Unauthorized finance write fails.
- Unauthorized HR access fails.
- Unauthorized task read fails.
- Unauthorized task write fails.
- Tampered client ID fails.
- Tampered employee ID fails.
- Tampered project ID fails.
- Tampered task ID fails.
- Tampered role payload fails.
- Deactivated user access fails.
- Duplicate invitation acceptance is safe.
- Duplicate client conversion is safe.
- Duplicate Drive automation is safe.
- Duplicate Calendar request is safe.
- Restricted search result names are not leaked.
- Google secrets are absent from client bundle.
- Slack secrets are absent from client bundle.

## UI / UX Work Needed

The app has a polished shared shell now, but full UX completion still needs:

- Page-by-page desktop QA.
- Page-by-page tablet QA.
- Page-by-page mobile QA.
- Cross-browser smoke test.
- Better field-level server action error rendering.
- Confirmation dialogs for destructive actions.
- Unsaved-change warnings where useful.
- Full empty/loading/error-state review on every module.
- Richer global search UI and result grouping.
- Filter controls for large operational tables.
- Mobile table review for all high-density pages.
- Accessibility review for keyboard, focus, labels, table semantics, and contrast.

## Testing Work Needed

Existing tests cover many service rules, but production completion needs:

- Browser E2E tests for the full business journey.
- Browser E2E tests for negative/security cases.
- Repository contract tests against a test Google Sheet.
- Drive idempotency integration tests.
- Calendar duplicate-prevention integration test against a test calendar.
- Slack notification adapter integration test.
- Gmail invitation integration test.
- Search permission-leakage tests.
- Production smoke test script.

## Production Hardening Needed

Before launch:

- Run dependency security audit.
- Run secret scan.
- Review secure cookie settings.
- Review SameSite behavior.
- Review CSRF risk for server actions/Auth.js architecture.
- Confirm production/dev secrets are separated.
- Confirm production logs never include OAuth secrets, private keys, raw tokens, or cookies.
- Add monitoring/logging destination.
- Document backup/export procedure.
- Test backup/export procedure.
- Document archive procedure.
- Simulate Sheets API failure.
- Simulate Drive API failure.
- Simulate Slack/Gmail/Calendar failure.
- Simulate Google quota/rate-limit failure.
- Verify user-facing integration errors are actionable.

## Deployment Work Needed

Production deployment requires:

- Separate Vercel project for CRM.
- Correct CRM GitHub repo connected.
- Production environment variables configured.
- `crm.reelkraftmedia.online` DNS configured.
- HTTPS verified.
- Production OAuth redirect verified.
- Production Sheets access verified.
- Production Drive access verified.
- Production Slack configuration verified.
- Production Gmail/Workspace verified.
- Production Calendar verified.
- Public website at `reelkraftmedia.online` confirmed unchanged.

## Documentation Work Needed

Before owner handoff:

- Update README after production setup.
- Keep environment-variable docs current.
- Add final RBAC matrix documentation.
- Add final Sheets schema documentation.
- Add Google OAuth setup guide with production callback URL.
- Add Google Drive setup guide.
- Add Slack setup guide.
- Add Calendar setup guide.
- Add Gmail setup guide.
- Add troubleshooting guide.
- Add backup/recovery guide.
- Add release checklist.
- Add known limitations.
- Remove or correct any unverified completion claims.

## Final Definition Of Done

The CRM can be called complete only when:

- Required UI exists.
- Real persistence works.
- Responsive behavior is verified.
- Loading, empty, and error states are verified.
- Client and server validation are verified.
- Authentication is verified.
- Authorization and record-level access are verified.
- Business rules are verified.
- Audit events are verified.
- Notifications are verified.
- Third-party failures are handled.
- Unit tests pass.
- Integration tests pass.
- E2E tests pass.
- Security tests pass.
- Accessibility basics are checked.
- Documentation is updated.
- No production workflow relies on mock/demo data.
- No dead critical buttons remain.
- No critical TODO/FIXME remains.
- No critical runtime errors remain.
- Production build passes.
- Lint passes.
- Typecheck passes.
- Production smoke test passes.
- Public website remains unchanged.
- Founder/admin signs off V1.
