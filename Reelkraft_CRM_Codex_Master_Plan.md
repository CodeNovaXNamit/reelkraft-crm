# Reelkraft Media CRM + Operations System
## Codex Master Build Specification

**Project:** Reelkraft Media Internal CRM & Operations System  
**Working product name:** Reelkraft OS  
**Target URL:** `https://crm.reelkraftmedia.online`  
**Repository:** `Reelkraft-Media-CRM`  
**Deployment:** Separate Vercel project, recommended name `reelkraft-crm`  
**Status:** Production build specification  
**Primary implementation agent:** Codex  
**Source blueprint:** Reelkraft Media — Internal CRM & Operations Blueprint

---

# 0. How Codex Must Use This Document

This file is the **master implementation contract** for the project.

Codex must:

1. Read this complete document before changing code.
2. Treat the requirements marked **MUST** as mandatory.
3. Build the system **phase-by-phase**, in the order defined below.
4. Do not begin the next phase until the current phase passes its Phase Gate.
5. Do not replace Google Sheets with PostgreSQL in V1 unless explicitly instructed.
6. Keep all data access behind repository/service abstractions so PostgreSQL can replace Sheets later.
7. Never modify the existing public Reelkraft website, repository, DNS configuration, or deployment except for the new CRM subdomain when explicitly requested.
8. Never put service-account credentials, OAuth client secrets, Slack secrets, Google API credentials, or private keys into client/browser code.
9. Enforce authorization on the server/backend. Hiding a menu item is **not** sufficient authorization.
10. Use production-quality TypeScript. Avoid `any` unless unavoidable and documented.
11. Do not leave placeholder screens, fake buttons, dead links, hardcoded business data, TODO-only implementations, or unhandled critical flows at the end of a phase.
12. Add tests for important business rules as each phase is built.
13. Keep the UI responsive and usable on desktop, tablet, and mobile.
14. Preserve auditability for sensitive and operational changes.
15. Prefer small, reviewable commits with clear commit messages.
16. Update project documentation whenever architecture, setup, permissions, data structures, or environment variables change.
17. Run required validation commands before declaring a phase complete.
18. When a requirement is ambiguous, prefer the interpretation that:
    - protects data,
    - preserves audit history,
    - maintains separation of concerns,
    - minimizes destructive behavior,
    - keeps the architecture migration-ready.

---

# 1. Product Mission

Build **Reelkraft OS** as the internal operating system for Reelkraft Media, not as a generic CRM.

The platform must connect the full agency workflow:

**Lead acquisition → Sales pipeline → Client onboarding → Projects → Tasks → Content production → Internal review → Client approval → Publishing → Reporting → Renewal**

The system should let the Founder/Admin answer:

> **“What is happening in Reelkraft right now?”**

within approximately 30 seconds from the Admin Dashboard.

---

# 2. Non-Negotiable Project Boundary

## 2.1 Existing public website

The existing public website is:

- `https://reelkraftmedia.online`
- `https://www.reelkraftmedia.online`

### MUST NOT

- modify its repository,
- modify its application code,
- replace its Vercel deployment,
- merge the CRM into the public website,
- share authentication sessions unintentionally,
- use the public website codebase as the CRM codebase.

## 2.2 New application

The CRM is a completely separate application:

- URL: `https://crm.reelkraftmedia.online`
- Repository: `Reelkraft-Media-CRM`
- Deployment: separate Vercel project
- Authentication: separate CRM authentication
- Environment variables: separate production/development secrets

---

# 3. V1 Technology Architecture

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | Next.js + TypeScript | Application UI and server functionality |
| UI | Tailwind CSS + shadcn/ui | Responsive component system |
| Authentication | Google Workspace / Google OAuth | Company identity and sign-in |
| Operational data | Google Sheets | V1 structured business data |
| File storage | Google Shared Drives | Large files, footage, designs, contracts, reports |
| Calendar | Google Calendar | Meetings, shoots, reviews, deadlines |
| Communication | Slack | Team communication and operational alerts |
| Email | Gmail / Google Workspace | Business email and selected notifications |
| Future persistence | PostgreSQL | Later high-volume transactional storage |

## 3.1 Architectural principle

All business code must interact with data through interfaces such as:

```text
UI / Route / Server Action
        ↓
Application Service
        ↓
Repository Interface
        ↓
Google Sheets Repository (V1)
        ↓
Google Sheets API
```

Future migration:

```text
UI / Route / Server Action
        ↓
Application Service
        ↓
Repository Interface
        ↓
PostgreSQL Repository (future)
```

The UI must not know whether records come from Google Sheets or PostgreSQL.

---

# 4. Recommended Application Structure

Codex may adjust exact naming where technically appropriate, but preserve separation of concerns.

```text
Reelkraft-Media-CRM/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── crm/
│   │   │   ├── leads/
│   │   │   ├── pipeline/
│   │   │   └── audit/
│   │   ├── clients/
│   │   ├── operations/
│   │   │   ├── projects/
│   │   │   ├── tasks/
│   │   │   └── workload/
│   │   ├── content/
│   │   │   ├── items/
│   │   │   ├── calendar/
│   │   │   └── approvals/
│   │   ├── team/
│   │   │   ├── employees/
│   │   │   ├── invitations/
│   │   │   └── permissions/
│   │   ├── finance/
│   │   ├── hr/
│   │   ├── calendar/
│   │   ├── files/
│   │   ├── reports/
│   │   ├── notifications/
│   │   ├── audit-logs/
│   │   └── settings/
│   └── api/
├── components/
│   ├── app-shell/
│   ├── data-table/
│   ├── forms/
│   ├── charts/
│   ├── feedback/
│   └── ui/
├── features/
│   ├── auth/
│   ├── crm/
│   ├── clients/
│   ├── projects/
│   ├── tasks/
│   ├── content/
│   ├── team/
│   ├── finance/
│   ├── hr/
│   ├── calendar/
│   ├── files/
│   ├── reports/
│   ├── notifications/
│   └── audit/
├── lib/
│   ├── auth/
│   ├── permissions/
│   ├── google/
│   ├── slack/
│   ├── validation/
│   ├── logging/
│   ├── ids/
│   ├── dates/
│   └── errors/
├── repositories/
│   ├── interfaces/
│   └── google-sheets/
├── services/
├── types/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
├── scripts/
├── public/
├── middleware.ts
├── README.md
└── .env.example
```

---

# 5. Product Navigation

## 5.1 Admin / Owner interface

Main navigation:

```text
Dashboard
CRM
  ├── Leads
  ├── Pipeline
  └── Pipeline Audit
Clients
Operations
  ├── Projects
  ├── Tasks
  └── Workload
Content
  ├── Content
  ├── Calendar
  └── Approvals
Team
  ├── Employees
  ├── Invitations
  └── Permissions
Finance
HR
Calendar
Files
Reports
Notifications
Audit Logs
Settings
```

## 5.2 Employee interface

Employee views must be permission-scoped:

```text
My Dashboard
My Tasks
My Projects
My Clients
My Content
My Calendar
Notifications
Profile
```

The system may use one shared application shell with role-aware routes rather than two entirely separate codebases.

---

# 6. Design & UX Requirements

## 6.1 Visual direction

Build a professional internal agency operations dashboard.

The design should feel:

- modern,
- premium,
- clean,
- fast,
- information-dense without feeling cluttered,
- suitable for daily business use.

## 6.2 Required UI patterns

Use consistent reusable patterns for:

- page header,
- breadcrumbs,
- KPI cards,
- data tables,
- searchable lists,
- Kanban boards,
- detail drawers,
- modal dialogs,
- confirmation dialogs,
- forms,
- filters,
- tabs,
- status badges,
- timeline/activity feed,
- empty states,
- loading states,
- error states,
- skeleton loaders,
- toast notifications,
- pagination,
- command/global search,
- mobile navigation.

## 6.3 Responsive behavior

Minimum target behavior:

- Desktop: full sidebar + dense tables.
- Tablet: collapsible sidebar and adaptive tables.
- Mobile: drawer navigation, stacked cards, horizontally scrollable tables only when unavoidable.

No critical action may be inaccessible on mobile.

## 6.4 Form behavior

Forms must include:

- client-side validation for usability,
- server-side validation for security,
- disabled submit state during request,
- success/error feedback,
- field-level errors,
- unsaved-change protection where meaningful,
- confirmation for destructive actions.

---

# 7. Authentication

## 7.1 Primary authentication

Primary sign-in method:

**Google Workspace / Google OAuth**

## 7.2 Authentication behavior

The system must:

- identify the signed-in user,
- map the email to an active Reelkraft employee record,
- load role and permissions,
- reject unauthorized accounts,
- reject deactivated users,
- establish a secure session,
- support logout,
- protect all dashboard routes.

## 7.3 Invitation workflow

Admin must be able to create an employee invitation with:

- name,
- email,
- role,
- department,
- manager,
- access level.

Invitation status:

```text
Pending → Accepted
        → Expired
        → Revoked
```

On first valid login after invitation:

1. validate invited email,
2. create/activate employee profile,
3. attach role/department/manager,
4. mark invitation accepted,
5. create audit event,
6. route employee to the appropriate dashboard.

## 7.4 Optional fallback

Email/password may be implemented only if explicitly required.

If implemented, it must use secure password hashing and the same backend RBAC model.

---

# 8. Initial Team & Roles

Initial team records from the project blueprint:

| Person | Role |
|---|---|
| Shivam | Founder / Admin |
| Samriti | Sales & Finance |
| Mehak | Operations Head & Social Media Manager |
| Neha | HR & Account Manager |
| Shahid | Video Editor & Designer Head |
| Kamal | Video Editor |

Initial users should be importable/seedable, but the final system must allow Admin to add future employees without developer intervention.

---

# 9. Role-Based Access Control

## 9.1 Base roles

```text
FOUNDER_ADMIN
OPERATIONS_HEAD
SALES_FINANCE
HR_ACCOUNT_MANAGER
VIDEO_DESIGN_HEAD
VIDEO_EDITOR
EMPLOYEE
```

## 9.2 Permission actions

Support at minimum:

```text
view
create
edit
delete
assign
approve
export
audit
```

## 9.3 Resource groups

Permissions should be expressible for:

```text
dashboard
leads
deals
pipeline
clients
projects
tasks
content
employees
invitations
finance
hr
calendar
files
reports
notifications
audit_logs
settings
```

## 9.4 Default role intent

| Role | Primary access |
|---|---|
| Founder/Admin | Everything |
| Operations Head | Operations, projects, team, content, assigned clients |
| Sales & Finance | Leads, pipeline, proposals, finance, payment tracking |
| HR & Account Manager | HR, assigned clients, projects, account management |
| Video/Design Head | Content, projects, reviews/approvals, assigned tasks |
| Video Editor | Assigned projects, tasks, content, Drive files |
| Employee | Assigned work only |

## 9.5 Enforcement rule

Every protected mutation and protected read must perform server-side authorization.

Example:

```text
Request
  ↓
Authenticated user?
  ↓
Active employee?
  ↓
Permission for resource/action?
  ↓
Record-level scope allowed?
  ↓
Business validation?
  ↓
Execute
  ↓
Audit
```

Never trust role, owner ID, employee ID, client ID, or permissions sent by the browser without server verification.

---

# 10. Google Sheets Data Architecture

Create one operational workbook:

**Reelkraft OS Database**

Original logical sheets:

- Employees
- Leads
- Deals
- Clients
- Projects
- Tasks
- Content
- Meetings
- Finance
- Payments
- Settings

Implementation-required supporting sheets:

- Invitations
- AuditLogs
- Notifications
- ClientContacts
- Activity
- Permissions or RolePermissions, if permission configuration is stored dynamically

These supporting sheets are necessary to satisfy invitation, audit, notification, activity-history, and access-control requirements.

## 10.1 Common system fields

Where relevant, records should include:

```text
id
createdAt
createdBy
updatedAt
updatedBy
version
isArchived
```

Use stable unique IDs. Never use Google Sheet row number as the permanent entity ID.

## 10.2 Data-access rules

- The CRM UI is the normal employee interface.
- Employees should not edit operational sheets directly.
- Use Google Sheets API through server-side code.
- Batch reads/writes where possible.
- Paginate large lists.
- Cache safe read-heavy data where appropriate.
- Retry transient Google API failures.
- Rate-limit expensive repeated actions.
- Never return raw private sheet data to unauthorized users.
- Handle duplicate IDs and missing rows defensively.
- Do not assume row order is permanent.
- Do not promise unlimited Sheets scale.

---

# 11. Core Data Models

These models define the minimum V1 domain shape. Exact internal types may evolve, but required business fields must remain supported.

## 11.1 Employee

```ts
type Employee = {
  id: string
  name: string
  email: string
  phone?: string
  role: Role
  department?: string
  managerId?: string
  joiningDate?: string
  status: "ACTIVE" | "INACTIVE"
  accessLevel?: string
  leaveStatus?: string
  workloadCapacity?: number
  avatarUrl?: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}
```

## 11.2 Invitation

```ts
type Invitation = {
  id: string
  email: string
  name: string
  role: Role
  department?: string
  managerId?: string
  accessLevel?: string
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED"
  invitedBy: string
  invitedAt: string
  expiresAt?: string
  acceptedAt?: string
}
```

## 11.3 Lead

Required fields:

```ts
type Lead = {
  id: string
  company: string
  contactName: string
  email?: string
  phone?: string
  website?: string
  industry?: string
  source?: string
  serviceInterested?: string
  dealValue?: number
  ownerId: string
  stage: PipelineStage
  probability?: number
  expectedCloseDate?: string
  lastContact?: string
  nextAction?: string
  notes?: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}
```

## 11.4 Pipeline stages

```text
NEW_LEAD
CONTACTED
QUALIFIED
DISCOVERY
PROPOSAL_SENT
NEGOTIATION
WON
LOST
```

Do not allow arbitrary stage values.

## 11.5 Deal

A deal may reuse commercial data from a lead while maintaining its own lifecycle.

Recommended fields:

```ts
type Deal = {
  id: string
  leadId: string
  company: string
  contactName?: string
  ownerId: string
  value: number
  stage: PipelineStage
  probability: number
  expectedCloseDate?: string
  lastContact?: string
  nextAction?: string
  wonAt?: string
  lostAt?: string
  lostReason?: string
  convertedClientId?: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}
```

## 11.6 Client

```ts
type Client = {
  id: string
  companyName: string
  primaryContactName?: string
  primaryEmail?: string
  primaryPhone?: string
  website?: string
  industry?: string
  service?: string
  accountManagerId?: string
  sourceLeadId?: string
  sourceDealId?: string
  driveFolderId?: string
  driveFolderUrl?: string
  onboardingStatus?: string
  health: "HEALTHY" | "ATTENTION" | "AT_RISK"
  recurringValue?: number
  renewalDate?: string
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED"
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}
```

## 11.7 Project

Required fields:

```ts
type Project = {
  id: string
  clientId: string
  projectName: string
  type?: string
  ownerId: string
  teamMemberIds: string[]
  startDate?: string
  dueDate?: string
  status: string
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  budget?: number
  health: "ON_TRACK" | "AT_RISK" | "BLOCKED"
  description?: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}
```

## 11.8 Task

Required fields:

```ts
type Task = {
  id: string
  title: string
  description?: string
  clientId?: string
  projectId?: string
  assignedToId: string
  createdBy: string
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  status: TaskStatus
  startDate?: string
  dueDate?: string
  estimatedTime?: number
  actualTime?: number
  driveLink?: string
  comments?: string
  createdAt: string
  updatedAt: string
  updatedBy: string
}
```

Task statuses:

```text
TO_DO
IN_PROGRESS
REVIEW
REVISION
APPROVED
COMPLETED
BLOCKED
```

## 11.9 Content Item

Required workflow:

```text
IDEA
SCRIPT
SHOOT
EDITING
INTERNAL_REVIEW
CLIENT_REVIEW
REVISION
APPROVED
SCHEDULED
PUBLISHED
```

Recommended model:

```ts
type ContentItem = {
  id: string
  clientId: string
  accountId?: string
  platform?: string
  contentType?: string
  topic?: string
  pillar?: string
  writerId?: string
  designerId?: string
  editorId?: string
  reviewerId?: string
  publishDate?: string
  driveFileId?: string
  driveFileUrl?: string
  version?: string
  status: ContentStatus
  revisionNotes?: string
  approvalNotes?: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}
```

## 11.10 Meeting

```ts
type Meeting = {
  id: string
  title: string
  type?: "CLIENT_MEETING" | "DISCOVERY_CALL" | "SHOOT" | "INTERNAL_REVIEW" | "CONTENT_DEADLINE" | "APPROVAL_MEETING" | "OTHER"
  clientId?: string
  projectId?: string
  taskId?: string
  startAt: string
  endAt: string
  attendees?: string[]
  googleCalendarEventId?: string
  meetingUrl?: string
  notes?: string
  createdAt: string
  createdBy: string
}
```

## 11.11 Finance / Invoice

```ts
type FinanceRecord = {
  id: string
  clientId: string
  invoiceNumber: string
  amount: number
  dueDate?: string
  status: "DRAFT" | "SENT" | "PARTIAL" | "PAID" | "OVERDUE"
  paymentDate?: string
  notes?: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}
```

## 11.12 Payment

```ts
type Payment = {
  id: string
  financeRecordId: string
  clientId: string
  amount: number
  paymentDate: string
  method?: string
  reference?: string
  notes?: string
  createdAt: string
  createdBy: string
}
```

## 11.13 Audit log

```ts
type AuditLog = {
  id: string
  userId: string
  action: string
  entityType: string
  entityId: string
  oldValue?: string
  newValue?: string
  metadata?: string
  createdAt: string
}
```

Audit logs must be read-only for normal employees.

---

# 12. Pipeline Audit Requirements

Every deal/pipeline stage movement must create an immutable history record.

Minimum audit fields:

- entity/deal ID,
- previous stage,
- new stage,
- changed by,
- timestamp,
- reason/notes,
- deal value,
- next action when applicable.

A stage change must not silently overwrite history.

Recommended transaction-like sequence:

```text
Validate permission
→ validate target stage
→ read current deal
→ write stage-change audit record
→ update deal
→ create general audit event
→ emit notification if required
→ return updated result
```

If an operation fails midway, surface the failure clearly and avoid pretending the complete workflow succeeded.

---

# 13. Lead → Won Deal → Client Conversion

When a deal reaches `WON`, show a **Convert to Client** action.

The conversion workflow should:

1. Verify the deal is WON.
2. Verify user permission.
3. Prevent duplicate conversion.
4. Create Client record.
5. Carry existing lead/deal information forward.
6. Assign account manager.
7. Create client Drive folder structure.
8. Create onboarding project.
9. Create onboarding tasks.
10. Create client activity history.
11. Link client back to the source deal.
12. Write audit logs.
13. Send required notifications.
14. Return the new client workspace.

This is a critical end-to-end business flow and must have integration/E2E coverage.

---

# 14. Client Workspace

Each client workspace must support:

```text
Overview
Contacts
Strategy
Projects
Tasks
Content
Files
Meetings
Reports
Payments
Activity
```

## 14.1 Client Overview

Recommended overview widgets:

- account manager,
- active projects,
- open tasks,
- overdue tasks,
- upcoming meetings,
- content in review,
- content awaiting client approval,
- outstanding payments,
- client health,
- renewal date,
- latest activity.

---

# 15. Projects & Tasks

## 15.1 Project views

Support:

- list/table view,
- filters,
- project detail page,
- project team,
- task summary,
- project health,
- due dates,
- linked Drive folder/files,
- client relationship.

## 15.2 Task views

Support:

- all authorized tasks,
- My Tasks,
- project tasks,
- client tasks,
- due today,
- overdue,
- blocked,
- review/revision,
- completed.

## 15.3 Task actions

Authorized users should be able to:

- create,
- edit,
- assign/reassign,
- change status,
- change due date,
- change priority,
- link Drive resource,
- add comments/notes,
- record estimated/actual time,
- complete task.

Important changes must create audit/activity events.

---

# 16. Workload

The workload screen should help Operations understand capacity.

At minimum show:

- employee,
- role/department,
- active tasks,
- overdue tasks,
- tasks due this week,
- active projects,
- priority distribution.

Do not invent sophisticated utilization formulas unless capacity/time data is reliable.

If utilization is shown, define the formula in code/docs.

---

# 17. Content Production System

This module is not a generic task board.

Required production workflow:

**Idea → Script → Shoot → Editing → Internal Review → Client Review → Revision → Approved → Scheduled → Published**

Track:

- client,
- account,
- platform,
- content type,
- topic,
- content pillar,
- writer,
- designer,
- editor,
- reviewer,
- publish date,
- Drive file,
- version,
- current status.

## 17.1 Required views

- Content table
- Status/Kanban view
- Content calendar
- Approvals queue
- Client-specific content
- Employee “My Content”
- Due-this-week view

## 17.2 Approval controls

Approval actions must be permission-aware.

Important events:

- submitted for internal review,
- revision requested,
- submitted for client review,
- client revision requested,
- approved,
- scheduled,
- published.

Each should create an activity/audit record.

---

# 18. Google Drive Architecture

Create/use Shared Drive:

**REELKRAFT MEDIA**

Required folder structure:

```text
REELKRAFT MEDIA
├── 01 ADMIN
├── 02 SALES
├── 03 CLIENTS
│   └── CLIENT NAME
│       ├── 01 Onboarding
│       ├── 02 Strategy
│       ├── 03 Raw Footage
│       ├── 04 Editing
│       ├── 05 Design
│       ├── 06 Review
│       ├── 07 Approved
│       └── 08 Reports
├── 04 CONTENT
├── 05 FINANCE
├── 06 MARKETING
├── 07 INTERNAL
└── 99 ARCHIVE
```

## 18.1 File handling rule

Large media files must stay in Google Drive.

The CRM should store:

- file ID,
- folder ID,
- URL,
- file name,
- MIME type where useful,
- owner/uploader metadata where useful,
- linked entity ID,
- timestamps.

Do not unnecessarily proxy huge media files through the Next.js/Vercel server.

## 18.2 Drive permissions

Use least-privilege access.

The application must not assume every employee can access every client folder.

---

# 19. Slack Architecture

Slack is:

- communication,
- notifications,
- alerts.

Slack is **not**:

- the system of record,
- the long-term operational database,
- the permanent file archive.

Recommended channels:

```text
#general
#announcements
#daily-operations
#sales
#finance
#hr
#content
#design
#video-editing
#client-updates
#deadlines
#approvals
#urgent
```

Optional private client channels may be supported.

## 19.1 Slack automation events

| Event | Target |
|---|---|
| New lead | `#sales` |
| Deal won | `#announcements` |
| Task assigned | employee DM or suitable task channel |
| Task overdue | `#deadlines` |
| Approval required | `#approvals` |
| Urgent issue | `#urgent` |

## 19.2 Reliability requirement

Business actions must not fail solely because Slack is unavailable.

Preferred pattern:

```text
Complete CRM business write
→ create notification event
→ attempt Slack delivery
→ record delivery success/failure
```

Expose recoverable integration errors to Admin where useful.

---

# 20. Google Calendar

Support:

- client meetings,
- discovery calls,
- shoots,
- internal reviews,
- content deadlines,
- approval meetings.

Each event should be linkable to:

- client,
- project,
- task.

Store Google Calendar event ID after successful creation.

Changes originating in CRM should avoid accidentally creating duplicate events.

---

# 21. Gmail / Google Workspace

Use Gmail/Workspace for selected operational email notifications.

Potential V1 use cases:

- employee invitation,
- meeting details,
- selected approval/request notifications,
- administrative notices.

Do not build a generic email marketing platform inside V1.

---

# 22. Finance

Finance access is restricted.

Primary operational owner: Sales & Finance role.  
Founder/Admin: full visibility.  
Other roles: only explicitly granted access.

Required functionality:

- finance/invoice record creation,
- client linkage,
- amount,
- due date,
- status,
- payment date,
- notes,
- payment tracking,
- outstanding/overdue calculation,
- filtering,
- dashboard aggregation.

Status:

```text
DRAFT
SENT
PARTIAL
PAID
OVERDUE
```

Do not implement payroll in V1.

---

# 23. HR

V1 HR is intentionally lightweight.

Track:

- employee ID,
- name,
- email,
- phone,
- role,
- department,
- manager,
- joining date,
- status,
- leave,
- workload.

Do not build payroll in V1.

HR records must follow RBAC. Sensitive HR information must not be exposed broadly.

---

# 24. Notifications

In-app notifications should support at minimum:

- task assigned,
- task due,
- task overdue,
- client approval required,
- revision requested,
- new lead,
- deal won,
- upcoming meeting,
- employee invited,
- role/access changed.

Recommended notification fields:

```text
id
recipientUserId
type
title
message
entityType
entityId
link
readAt
createdAt
deliveryStatus
```

Provide:

- unread count,
- mark read,
- mark all read,
- deep link to related record.

---

# 25. Audit Logs

Important system actions must generate an audit record.

Audit-worthy actions include:

- login/security events where appropriate,
- employee invited,
- employee activated/deactivated,
- role changed,
- manager changed,
- permission changed,
- lead created/edited,
- deal stage changed,
- deal won/lost,
- client created,
- client assignment changed,
- project created/updated,
- task assigned/status changed,
- content approval/revision/status changes,
- finance status/payment changes,
- important settings changes.

Audit UI should support:

- search,
- user filter,
- action filter,
- entity type filter,
- date filter,
- entity ID lookup.

Normal employees must not be able to edit/delete audit history.

---

# 26. Global Search

Global search must return authorized results across:

- clients,
- leads,
- deals,
- projects,
- tasks,
- content,
- employees,
- Drive files.

Results must respect permissions and record-level access.

Recommended interaction:

- keyboard shortcut,
- command/search dialog,
- grouped results,
- quick navigation,
- optional recent searches.

Do not leak restricted record titles through search.

---

# 27. Filters

Major modules should support relevant combinations of:

- search text,
- status,
- owner,
- client,
- date,
- priority,
- department,
- platform.

Filters should preferably be reflected in URL search parameters so views can be bookmarked/shared where permissions allow.

---

# 28. Reports

## 28.1 Sales

Metrics:

- lead count,
- qualified leads,
- proposal count,
- won,
- lost,
- conversion rate,
- pipeline value,
- weighted pipeline,
- revenue.

## 28.2 Operations

Metrics:

- tasks,
- overdue tasks,
- active projects,
- workload,
- utilization where defined.

## 28.3 Content

Metrics:

- content produced,
- approved,
- revision rate,
- published.

## 28.4 Clients

Metrics:

- healthy,
- at-risk,
- renewals,
- recurring value.

Reports should state date ranges and filters clearly.

---

# 29. Admin Dashboard

The Admin Dashboard is the primary command center.

## 29.1 Business KPIs

- Active clients
- Pipeline value
- Weighted pipeline
- Won revenue
- Monthly recurring value
- Outstanding payments

## 29.2 Sales KPIs

- New leads
- Qualified leads
- Proposal stage
- Negotiation
- Won
- Lost

## 29.3 Operations KPIs

- Active projects
- Tasks due today
- Overdue tasks
- Employee workload

## 29.4 Content KPIs

- Content due this week
- Internal review
- Client approvals
- Publishing calendar

## 29.5 Client KPIs

- Healthy
- Attention
- At risk
- Renewals

## 29.6 Activity

Recent:

- system actions,
- assignments,
- approvals,
- status changes.

Every KPI should link to a filtered source view when practical.

---

# 30. Employee Dashboard

The employee dashboard must be scoped to the logged-in user.

Recommended content:

- My tasks due today
- My overdue tasks
- My tasks this week
- My active projects
- My clients
- My content queue
- My upcoming meetings
- Notifications
- Recent activity relevant to me

Employees must not see company-wide finance/admin KPIs without permission.

---

# 31. Error Handling Standard

Use a consistent application error model.

Categories:

```text
AUTHENTICATION_ERROR
AUTHORIZATION_ERROR
VALIDATION_ERROR
NOT_FOUND
CONFLICT
INTEGRATION_ERROR
RATE_LIMIT
INTERNAL_ERROR
```

Requirements:

- do not expose credentials or stack traces in production UI,
- return actionable user-facing messages,
- log diagnostic details server-side,
- distinguish retryable integration failures,
- preserve correlation/request IDs where feasible.

---

# 32. Observability & Logging

At minimum:

- structured server logs,
- integration error logs,
- authentication failure logs,
- critical business-flow errors,
- deployment/runtime error monitoring.

Never log:

- OAuth secrets,
- private keys,
- raw access tokens,
- sensitive credentials.

---

# 33. Security Requirements

Mandatory:

- Google OAuth/company identity
- backend RBAC
- protected API routes/server actions
- no service credentials in browser code
- encrypted HTTPS connections
- secure session management
- immutable audit trail
- least-privilege Drive permissions
- separate production and development secrets

Additional implementation requirements:

- validate all server inputs,
- protect against IDOR,
- verify record ownership/scope,
- CSRF protection where relevant to auth/action mechanism,
- secure cookies,
- appropriate same-site configuration,
- sanitize or safely render user-entered rich text,
- do not trust client-side hidden fields,
- avoid exposing stack traces in production,
- dependency security review before launch,
- rate-limit abuse-prone endpoints,
- confirm destructive actions.

---

# 34. Performance & Google API Scalability

Because V1 uses Google APIs, the system must be designed around quota awareness.

Use:

- pagination,
- caching,
- batching,
- debounced search,
- selective fields,
- server-side aggregation where appropriate,
- archival strategy,
- retry with exponential backoff for transient failures.

Avoid:

- full workbook reads for every page request,
- N+1 Google API calls,
- refetching static settings repeatedly,
- loading all rows into the browser,
- using Slack as permanent history,
- sending large Drive files through Vercel functions.

---

# 35. Environment Variables

Create `.env.example` with placeholder names only.

Recommended categories:

```bash
# App
NEXT_PUBLIC_APP_URL=
NODE_ENV=

# Auth / Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Google Workspace / APIs
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=
GOOGLE_SHEETS_DATABASE_ID=
GOOGLE_SHARED_DRIVE_ID=
GOOGLE_CALENDAR_ID=

# Slack
SLACK_BOT_TOKEN=
SLACK_SIGNING_SECRET=
SLACK_CHANNEL_ANNOUNCEMENTS=
SLACK_CHANNEL_SALES=
SLACK_CHANNEL_DEADLINES=
SLACK_CHANNEL_APPROVALS=
SLACK_CHANNEL_URGENT=

# Optional email/integration settings
GOOGLE_WORKSPACE_ADMIN_EMAIL=

# Monitoring
# Add provider-specific variables only when selected.
```

Exact auth variables may differ based on chosen authentication library, but secret separation must remain.

Do not commit real values.

---

# 36. Coding Standards

## 36.1 TypeScript

- strict mode enabled,
- typed repository interfaces,
- typed domain models,
- typed validation schemas,
- no broad `any`,
- discriminated unions for statuses where useful.

## 36.2 Validation

Define central validation schemas for writes.

Do not duplicate unrelated validation logic across components.

## 36.3 Server/client separation

Prefer server-side data access.

Only mark components as client components when browser interactivity requires it.

Do not import secret-bearing integration modules into client bundles.

## 36.4 Reusability

Create reusable:

- DataTable,
- FilterBar,
- StatusBadge,
- PersonPicker,
- ClientPicker,
- DatePicker,
- EmptyState,
- ErrorState,
- ConfirmDialog,
- ActivityTimeline,
- EntityHeader,
- KPI card,
- permission guard utilities.

---

# 37. Testing Strategy

## 37.1 Unit tests

Test:

- permissions,
- status transitions,
- weighted pipeline calculation,
- client conversion rules,
- finance calculations,
- date/overdue rules,
- validation,
- repository mapping.

## 37.2 Integration tests

Test:

- repository contracts,
- Google Sheets row mapping,
- Google Drive folder creation abstraction,
- Slack notification abstraction,
- Calendar event abstraction,
- critical service orchestration.

Mock external APIs where appropriate.

## 37.3 E2E tests

Critical E2E flows:

1. Admin signs in.
2. Admin invites employee.
3. Employee accepts/activates account.
4. Lead is created.
5. Deal moves through stages.
6. Stage changes appear in audit.
7. Deal is won.
8. Won deal converts to client.
9. Client onboarding project is created.
10. Task is assigned.
11. Employee sees task.
12. Task moves to completed.
13. Content item moves through review/approval.
14. Calendar event is linked.
15. Finance record is created.
16. Global search finds authorized records.
17. Unauthorized employee cannot access restricted finance/admin data.
18. Mobile navigation remains usable.

## 37.4 Security tests

At minimum test:

- unauthenticated route access,
- unauthorized API/action access,
- record-level access,
- deactivated users,
- tampered IDs,
- role escalation attempts,
- restricted search results.

---

# 38. Accessibility

Target professional accessibility basics:

- keyboard navigation,
- visible focus,
- semantic labels,
- form labels,
- sufficient contrast,
- accessible dialogs,
- accessible tables,
- meaningful button names,
- no color-only status meaning.

---

# 39. Phase Execution Rules

For every phase, Codex must:

1. Read the phase scope.
2. Inspect existing code before editing.
3. Create/adjust architecture needed for the phase.
4. Implement features completely.
5. Add validation.
6. Add authorization.
7. Add loading/empty/error states.
8. Add audit/notifications where required.
9. Add/update tests.
10. Update documentation.
11. Run validation commands.
12. Fix all errors introduced by the phase.
13. Provide a completion report.
14. Stop before the next phase unless instructed to continue.

A phase is **not complete** merely because screens render.

---

# 40. PHASE 0 — Repository, Engineering Foundation & Project Guardrails

## Objective

Prepare a clean production-grade foundation before business features.

## Scope

- Create separate repository/application.
- Initialize Next.js + TypeScript.
- Tailwind + shadcn/ui.
- Lint/format/type-check/test setup.
- Base directory architecture.
- Environment validation.
- README.
- `.env.example`.
- app shell skeleton.
- error boundaries.
- logging foundation.
- shared validation and error utilities.
- repository/service abstraction interfaces.
- ensure existing public website is untouched.

## Deliverables

- application boots locally,
- production build succeeds,
- `/` redirects appropriately,
- dashboard shell exists,
- environment validation works,
- no secrets committed,
- testing framework configured,
- CI-ready scripts defined.

## Required scripts

At minimum:

```json
{
  "dev": "...",
  "build": "...",
  "lint": "...",
  "typecheck": "...",
  "test": "...",
  "test:e2e": "..."
}
```

Exact command implementation depends on chosen tooling.

## Phase Gate

- [ ] Separate repository confirmed
- [ ] Existing public website unchanged
- [ ] Local development starts successfully
- [ ] Production build passes
- [ ] Lint passes
- [ ] Typecheck passes
- [ ] Test runner works
- [ ] `.env.example` exists
- [ ] README setup instructions work
- [ ] Core folder architecture exists
- [ ] No real secrets in git

---

# 41. PHASE 1 — Foundation: Authentication, RBAC, Sheets, Drive & Base Admin Shell

This corresponds to the original Foundation phase.

## Objective

Create secure company identity, employee access, backend permission enforcement, and operational storage adapters.

## Scope

### Authentication

- Google Workspace/OAuth sign-in
- authenticated session
- login page
- logout
- unauthorized screen
- deactivated account handling

### Team foundation

- Employees repository
- Invitations repository
- Admin invitation flow
- employee activation
- role assignment
- manager assignment
- activate/deactivate employee

### RBAC

- roles
- permissions
- backend authorization helper
- route/server-action protection
- record-scope support

### Google Sheets

- workbook connection
- repository adapters
- schema/mapping utilities
- retry/error handling
- stable IDs

### Google Drive

- Shared Drive connection
- root folder validation
- safe file/folder metadata access

### Base dashboard shell

- responsive sidebar
- top navigation
- user menu
- notification placeholder infrastructure
- global layout
- role-aware navigation

## Acceptance Criteria

- Admin can sign in.
- Unauthorized account cannot enter.
- Admin can invite employee.
- Invited employee can become an active employee.
- Admin can deactivate employee.
- Deactivated employee is denied.
- Permissions are enforced server-side.
- Google Sheets adapter can read/write test records safely.
- Google Drive adapter can resolve configured Shared Drive.
- UI is responsive.
- Audit events exist for invitation/access changes.

## Tests

- auth guards
- permission matrix
- invitation lifecycle
- employee activation/deactivation
- unauthorized server mutation
- repository mapping

## Phase Gate

- [ ] All acceptance criteria pass
- [ ] Role escalation attempt fails
- [ ] No secrets exposed to browser bundle
- [ ] Build/lint/typecheck/tests pass
- [ ] Admin and employee login manually verified

---

# 42. PHASE 2 — CRM, Sales Pipeline, Pipeline Audit & Client Conversion

This corresponds to the original CRM phase.

## Objective

Make Reelkraft’s lead-to-client sales workflow fully operational.

## Scope

### Leads

- create
- view
- edit
- search
- filters
- owner assignment
- next action
- notes

### Pipeline

- Kanban pipeline
- stage movement
- stage validation
- deal value
- probability
- expected close date
- won/lost

### Pipeline Audit

- immutable stage history
- reason/notes
- previous/new stage
- actor/time
- deal value
- next action

### Clients

- Convert to Client flow
- client list
- client overview
- contacts
- account manager assignment
- client activity history

### Drive onboarding

- create client folder hierarchy on conversion
- persist folder ID/link

### Onboarding

- create onboarding project
- create onboarding tasks

## UI Pages

```text
/crm/leads
/crm/leads/[id]
/crm/pipeline
/crm/audit
/clients
/clients/[id]
```

## Acceptance Criteria

- Lead can be created.
- Lead/deal appears in correct pipeline stage.
- Authorized user can move a deal.
- Every stage move creates history.
- Won/lost states work.
- WON deal can convert exactly once.
- Client conversion carries source data.
- Client Drive structure is created.
- Onboarding project/tasks are created.
- Client workspace opens.
- Unauthorized users cannot modify pipeline/client data.

## Tests

Critical integration/E2E:

```text
Create lead
→ progress pipeline
→ verify audit history
→ mark won
→ convert client
→ verify client
→ verify onboarding project/tasks
→ verify Drive folder linkage
```

## Phase Gate

- [ ] Sales flow works end-to-end
- [ ] Duplicate client conversion prevented
- [ ] Pipeline audit is immutable in normal UI
- [ ] Search/filter behavior works
- [ ] Responsive CRM views pass
- [ ] Build/lint/typecheck/tests pass

---

# 43. PHASE 3 — Operations: Projects, Tasks, Assignments, Workload & Notifications

## Objective

Make day-to-day agency delivery manageable from the CRM.

## Scope

### Projects

- create/edit
- owner
- team members
- dates
- status
- priority
- budget
- health
- client linkage
- Drive linkage

### Tasks

- create/edit
- project/client linkage
- assignment
- priority
- status
- dates
- estimated time
- actual time
- Drive link
- comments

### Employee work views

- My Tasks
- My Projects
- due today
- overdue
- blocked
- review
- completed

### Workload

- employee workload view
- task/project counts
- overdue visibility

### Notifications

- task assigned
- task due
- task overdue
- project/task changes where useful

## Acceptance Criteria

- Authorized user can create project.
- Authorized user can assign project team.
- Task can be created and assigned.
- Employee sees assigned task.
- Status transitions work.
- Overdue logic is correct.
- Workload reflects live operational records.
- Important changes appear in activity/audit history.
- Notification records are created.

## Tests

- assignment access
- overdue calculations
- status validation
- task record scope
- unauthorized cross-employee data access

## Phase Gate

- [ ] Project/task workflow works end-to-end
- [ ] My Tasks is correctly scoped
- [ ] Workload view is accurate
- [ ] Notification records work
- [ ] Build/lint/typecheck/tests pass

---

# 44. PHASE 4 — Content Production, Content Calendar, Approvals & Drive Version Links

## Objective

Build Reelkraft’s specialized production pipeline.

## Scope

- content records
- status workflow
- Kanban/status view
- content table
- content calendar
- employee “My Content”
- internal review
- client review
- revision
- approval
- scheduled
- published
- Drive file linking
- version field/history
- approval queue
- audit/activity

## Acceptance Criteria

- Content item can be created.
- Required people can be assigned.
- Content moves only through valid statuses.
- Reviewers can approve/revise when permitted.
- Client-review/revision states are visible.
- Drive resource is linkable.
- Publish date appears in calendar.
- Approval actions create audit/activity.
- Employee sees assigned content only where role requires.

## Tests

- status transition rules
- approval permissions
- revision workflow
- calendar date rendering
- content record security

## Phase Gate

- [ ] Content flow works from Idea to Published
- [ ] Approvals/revisions are auditable
- [ ] Content calendar works
- [ ] Drive links persist correctly
- [ ] Build/lint/typecheck/tests pass

---

# 45. PHASE 5 — Business Operations: Finance, HR, Calendar, Client Health & Reports

## Objective

Add management visibility and supporting business operations.

## Scope

### Finance

- finance records
- payments
- outstanding
- overdue
- access control
- dashboard metrics

### HR

- employee HR profile
- department
- manager
- joining date
- status
- leave
- workload
- no payroll

### Calendar

- CRM meetings
- Google Calendar integration
- entity linkage
- upcoming meetings

### Client health

- Healthy
- Attention
- At Risk
- renewal dates
- recurring value

### Reports

- Sales
- Operations
- Content
- Clients

## Acceptance Criteria

- Finance role can create/update authorized records.
- Admin sees finance.
- Unauthorized employee cannot see finance.
- HR fields work for authorized roles.
- Payroll does not exist in V1.
- Calendar event can be created and linked.
- Reports honor date filters.
- Client health appears in relevant dashboards.

## Tests

- finance permissions
- invoice/payment calculations
- calendar linking
- report calculations
- HR authorization

## Phase Gate

- [ ] Finance security verified
- [ ] HR security verified
- [ ] Calendar integration verified
- [ ] Report totals checked against source records
- [ ] Build/lint/typecheck/tests pass

---

# 46. PHASE 6 — Automations: Slack, Gmail, Drive, Calendar, Onboarding & Renewals

## Objective

Reduce repetitive coordination without making third-party tools the system of record.

## Scope

### Slack

- new lead
- deal won
- task assigned
- task overdue
- approval required
- urgent issue

### Gmail

- invitations
- selected operational notifications

### Drive

- client folder automation
- folder metadata sync helpers

### Calendar

- event creation/update helpers
- duplication protection

### Onboarding automation

- won deal → client → folder → project → tasks → notifications

### Renewal automation

- upcoming renewal detection
- admin/account-manager notifications

## Reliability requirements

External notification failure must not corrupt the core CRM write.

Integrations should report:

```text
PENDING
SENT
FAILED
```

where useful.

## Acceptance Criteria

- Slack notifications fire for configured events.
- Gmail invitations/selected notices work.
- Drive automation is repeat-safe.
- Calendar creation avoids duplicates.
- Onboarding orchestration works.
- Renewal alerts work.
- Integration failures are visible/logged and recoverable.

## Phase Gate

- [ ] Slack verified
- [ ] Gmail verified
- [ ] Drive automation verified
- [ ] Calendar automation verified
- [ ] Failure handling verified
- [ ] Build/lint/typecheck/tests pass

---

# 47. PHASE 7 — Advanced / Post-V1 Features

Do not build these during core V1 unless explicitly instructed.

Potential scope:

- Client portal
- WhatsApp integration
- AI assistant
- Forecasting
- Advanced automation

Before implementing any Phase 7 feature, define:

- business use case,
- privacy implications,
- permissions,
- data source,
- cost,
- API limits,
- user acceptance criteria.

---

# 48. PHASE 8 — Production Hardening, QA, Migration Readiness & Go-Live

## Objective

Turn the completed feature set into a dependable production system.

## Scope

### Security

- route/action authorization review
- IDOR review
- secrets review
- production environment review
- dependency audit
- least privilege

### Data

- Sheets schema validation
- backup/export procedure
- archival procedure
- duplicate detection
- corrupted-row handling
- migration-ready repository tests

### UX

- mobile QA
- keyboard QA
- empty/loading/error states
- destructive confirmation
- cross-browser smoke testing

### Reliability

- integration failure testing
- API quota handling
- retry behavior
- logging/monitoring
- error boundaries

### Deployment

- production Vercel project
- `crm.reelkraftmedia.online`
- HTTPS
- production OAuth redirect URLs
- production Google permissions
- production Slack configuration
- smoke test

### Documentation

- README
- setup
- environment variables
- architecture
- roles/permissions
- Sheets schema
- Google Workspace setup
- Drive setup
- Slack setup
- troubleshooting
- backup/recovery
- release checklist

## Final E2E acceptance

The following must all pass:

- Admin login works.
- Employee login works.
- Admin can invite employees.
- Employee can accept invitation.
- Role permissions are enforced.
- Lead can be created.
- Deal can move through pipeline.
- Pipeline movement is audited.
- Won deal can become client.
- Client project can be created.
- Task can be assigned and completed.
- Slack notification is delivered for configured flow.
- Drive file/folder can be linked.
- Content can move through approval workflow.
- Calendar event can be created.
- Finance record can be created.
- Admin dashboard works.
- Employee dashboard works.
- Global search works.
- Audit log works.
- Mobile layout works.
- Production environment is security tested.
- Existing website remains unchanged.

## Phase Gate

- [ ] All critical E2E tests pass
- [ ] Production build passes
- [ ] Lint passes
- [ ] Typecheck passes
- [ ] Unit/integration suite passes
- [ ] Mobile QA passes
- [ ] Permission audit passes
- [ ] Secret scan passes
- [ ] Production smoke test passes
- [ ] Existing website verified unchanged
- [ ] Owner/Admin signs off V1

---

# 49. Definition of Done for Every Feature

A feature is only done when all relevant items are true:

- [ ] correct UI exists
- [ ] responsive UI exists
- [ ] loading state exists
- [ ] empty state exists
- [ ] error state exists
- [ ] client validation exists
- [ ] server validation exists
- [ ] authentication enforced
- [ ] authorization enforced
- [ ] record-level scope enforced where required
- [ ] business rule enforced
- [ ] audit event created where required
- [ ] notification created where required
- [ ] external integration failure handled
- [ ] tests added/updated
- [ ] accessibility basics checked
- [ ] documentation updated
- [ ] no placeholder data remains
- [ ] no console/runtime error
- [ ] build/lint/typecheck/tests pass

---

# 50. Data Migration Readiness

Although V1 uses Google Sheets, design repository contracts so a future migration can introduce:

```text
repositories/
├── interfaces/
├── google-sheets/
└── postgres/
```

Business services must depend on interfaces, not concrete Sheets implementations.

Do not embed sheet column numbers throughout business code.

Prefer central mapping such as:

```text
Sheet row
↕
Mapper
↕
Domain entity
↕
Repository
↕
Application service
```

This is mandatory for future scale.

---

# 51. Suggested Repository Interfaces

Illustrative only; Codex may refine signatures.

```ts
interface LeadRepository {
  findById(id: string): Promise<Lead | null>
  list(query: LeadQuery): Promise<PaginatedResult<Lead>>
  create(input: CreateLeadInput, actor: Actor): Promise<Lead>
  update(id: string, input: UpdateLeadInput, actor: Actor): Promise<Lead>
}

interface DealRepository {
  findById(id: string): Promise<Deal | null>
  list(query: DealQuery): Promise<PaginatedResult<Deal>>
  create(input: CreateDealInput, actor: Actor): Promise<Deal>
  update(id: string, input: UpdateDealInput, actor: Actor): Promise<Deal>
}

interface ClientRepository {
  findById(id: string): Promise<Client | null>
  list(query: ClientQuery): Promise<PaginatedResult<Client>>
  create(input: CreateClientInput, actor: Actor): Promise<Client>
  update(id: string, input: UpdateClientInput, actor: Actor): Promise<Client>
}
```

Create equivalent interfaces for:

- employees,
- invitations,
- projects,
- tasks,
- content,
- meetings,
- finance,
- payments,
- notifications,
- audit logs.

---

# 52. Application Service Examples

Important workflows belong in application services rather than UI components.

Suggested services:

```text
AuthService
InvitationService
EmployeeService
LeadService
PipelineService
ClientConversionService
ClientService
ProjectService
TaskService
ContentWorkflowService
DriveService
CalendarService
FinanceService
NotificationService
SlackService
AuditService
ReportService
SearchService
```

---

# 53. Important Idempotency Rules

Operations likely to be retried must avoid duplicate side effects.

Use idempotent/repeat-safe behavior for:

- Convert to Client
- create client Drive folders
- onboarding project creation
- onboarding task creation
- Google Calendar event creation
- Slack notifications where feasible
- invitation acceptance
- renewal alerts

Example:

If `sourceDealId` already has a `convertedClientId`, return/route to the existing client rather than create a second one.

---

# 54. Date & Time Rules

- Store timestamps in a consistent machine-readable format.
- Display dates in the intended business timezone.
- Make timezone handling explicit for Calendar.
- Do not compare formatted strings for overdue logic.
- Define “today” consistently.
- Include timezone when storing external event timestamps.

---

# 55. Currency Rules

Primary finance examples use INR.

Implementation should:

- store numeric amount separately from display formatting,
- define currency field if future multi-currency support is possible,
- never parse UI-formatted `₹` strings as canonical amount values.

Recommended:

```ts
amount: number
currency: "INR"
```

---

# 56. Search & Pagination Contract

List APIs/repositories should support:

```ts
type PageQuery = {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortDirection?: "asc" | "desc"
  filters?: Record<string, string | string[] | undefined>
}
```

Set sane maximum page size.

Do not ship entire large Sheets datasets to the browser merely to paginate client-side.

---

# 57. Status Transition Rules

Define status transitions centrally rather than using free-form status updates.

Examples:

## Pipeline

```text
NEW_LEAD
  → CONTACTED
  → QUALIFIED
  → DISCOVERY
  → PROPOSAL_SENT
  → NEGOTIATION
  → WON
  → LOST
```

Allow justified backward transitions if business rules permit, but audit them.

## Content

```text
IDEA
→ SCRIPT
→ SHOOT
→ EDITING
→ INTERNAL_REVIEW
→ CLIENT_REVIEW
→ REVISION
→ APPROVED
→ SCHEDULED
→ PUBLISHED
```

Revision may return to an appropriate prior production state.

## Tasks

```text
TO_DO
→ IN_PROGRESS
→ REVIEW
→ REVISION
→ APPROVED
→ COMPLETED
```

`BLOCKED` may be entered from applicable active states and should retain enough context to resume.

---

# 58. Dashboard Calculation Rules

Calculations must be documented and testable.

Examples:

## Pipeline value

Sum deal values for active/open pipeline stages.

## Weighted pipeline

```text
weightedValue = dealValue × probability / 100
```

Sum across relevant open deals.

## Outstanding payments

Sum unpaid balance for finance records that are not fully paid.

## Overdue task

```text
dueDate < current business date
AND status != COMPLETED
```

Exact approved/completed treatment should be defined in implementation docs.

---

# 59. Client Health

Allowed values:

```text
HEALTHY
ATTENTION
AT_RISK
```

For V1, health may be manually managed by authorized account/operations roles.

Do not create opaque automatic risk scoring unless the owner asks for it.

Future automation may derive health from:

- overdue deliverables,
- revision volume,
- unpaid invoices,
- engagement,
- renewal proximity.

---

# 60. Archive vs Delete

Prefer archival for important business records.

Entities such as:

- clients,
- leads/deals with history,
- projects,
- content,
- finance records,
- employees

should generally not be physically deleted from operational history through normal UI.

Where delete exists:

- require permission,
- require confirmation,
- audit it,
- avoid breaking linked records.

---

# 61. Settings

Admin settings may contain:

- business name,
- timezone,
- default currency,
- pipeline probabilities,
- content platforms/types,
- departments,
- task priorities/status configuration only where safe,
- notification preferences,
- Slack channel mappings,
- Drive root configuration references,
- Calendar configuration references.

Do not expose secrets as plaintext editable settings in browser UI.

Secrets belong in environment/secret management.

---

# 62. Owner Setup Checklist

Before production launch:

- [ ] Confirm Google Workspace for `reelkraftmedia.online`
- [ ] Create Shared Drive `REELKRAFT MEDIA`
- [ ] Create required Drive folders
- [ ] Create Slack workspace `Reelkraft Media`
- [ ] Create required Slack channels
- [ ] Create CRM GitHub repository
- [ ] Create separate Vercel project
- [ ] Configure `crm.reelkraftmedia.online`
- [ ] Configure Google OAuth/API access securely
- [ ] Configure production environment variables
- [ ] Add initial team members
- [ ] Test Founder/Admin workflow
- [ ] Test Employee workflow
- [ ] Approve V1 for daily use

---

# 63. Codex Phase Completion Report Template

At the end of every phase, Codex should return a report in this structure:

```markdown
# Phase X Completion Report

## Completed
- ...

## Files Added
- ...

## Files Changed
- ...

## Architecture Decisions
- ...

## Data/Schema Changes
- ...

## Security/RBAC
- ...

## Tests Added
- ...

## Validation Results
- build: PASS/FAIL
- lint: PASS/FAIL
- typecheck: PASS/FAIL
- unit tests: PASS/FAIL
- integration tests: PASS/FAIL
- e2e tests: PASS/FAIL / NOT APPLICABLE

## Manual Checks
- ...

## Known Limitations
- ...

## Phase Gate
- [x] ...
- [ ] ...

## Next Phase
Do not start until explicitly instructed.
```

---

# 64. Recommended Codex Working Prompt

Use the following instruction when starting a phase:

```text
Read REELKRAFT_CRM_CODEX_MASTER_PLAN.md completely.

We are implementing PHASE [X] only.

Follow the project boundaries, architecture, security rules, repository/service abstraction, RBAC requirements, coding standards, testing requirements and Phase Gate in the master plan.

Before editing:
1. inspect the current repository,
2. identify what already exists,
3. avoid breaking completed phases.

Implement the phase completely. Do not use placeholder data, dead buttons, or fake success states. Add/update tests and documentation.

Run the phase validation commands before finishing.

At the end, provide the Phase Completion Report using the exact template from the master plan.

Do not begin the next phase.
```

---

# 65. Final Production Quality Standard

The completed Reelkraft OS should behave like a dependable internal business system, not a prototype.

It must be:

- secure,
- permission-aware,
- auditable,
- responsive,
- maintainable,
- integration-safe,
- quota-conscious,
- migration-ready,
- understandable by future developers,
- usable by non-technical employees every day.

The CRM UI is the primary operating interface. Google Sheets is a V1 persistence implementation, Google Drive is the large-file source, Slack is the communication layer, and the repository/service architecture must keep the product ready for future PostgreSQL scale.

---

# 66. Final V1 Success Statement

V1 is ready for operational use only when:

> Reelkraft can capture a lead, move it through the sales pipeline with a complete audit trail, convert a won deal into a client, automatically create the client’s operational structure, manage projects/tasks/content, coordinate approvals and deadlines, link Drive resources, manage authorized finance/HR/calendar records, notify the team, search the system, report company status, and enforce permissions across Admin and Employee workflows—without modifying the existing public website.

