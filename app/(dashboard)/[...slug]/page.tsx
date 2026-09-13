import { notFound } from "next/navigation";
import { ModulePage, type ModuleDefinition } from "@/components/app-shell/module-page";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { activePipelineStages } from "@/lib/dates/business-time";

const controls = {
  table: ["data table", "filters", "detail drawer", "activity timeline"],
  board: ["Kanban board", "status badges", "change dialog", "audit trail"],
  admin: ["permission matrix", "confirmation dialog", "audit history", "search"],
};

const modules: Record<string, ModuleDefinition> = {
  dashboard: {
    title: "Admin Dashboard",
    eyebrow: "Command center",
    description:
      "Phase 1 protects the dashboard shell with Google Workspace authentication, employee access mapping, server-side RBAC, and Google Workspace storage adapters.",
    phase: "Phase 1 foundation",
    route: "/dashboard",
    requiredControls: ["KPI cards", "activity feed", "role-aware navigation", "global search"],
    serverBoundary: "DashboardService through repository interfaces",
  },
  "crm/leads": {
    title: "Leads",
    eyebrow: "CRM",
    description:
      "Lead capture, ownership, filtering, validation, and pipeline conversion are implemented in Phase 2 on top of this route and service boundary.",
    phase: "Phase 2",
    route: "/crm/leads",
    requiredControls: controls.table,
    serverBoundary: "LeadService through LeadRepository",
  },
  "crm/pipeline": {
    title: "Sales Pipeline",
    eyebrow: "CRM",
    description:
      "Pipeline routing is reserved for validated stage movement, weighted value calculations, and auditable won/lost workflow.",
    phase: "Phase 2",
    route: "/crm/pipeline",
    requiredControls: controls.board,
    serverBoundary: "PipelineService through DealRepository and AuditLogRepository",
  },
  "crm/audit": {
    title: "Pipeline Audit",
    eyebrow: "CRM",
    description:
      "Pipeline audit access is registered as a read-only operational route for immutable stage-change history.",
    phase: "Phase 2",
    route: "/crm/audit",
    requiredControls: ["audit table", "date filters", "entity lookup", "export guard"],
    serverBoundary: "AuditService through AuditLogRepository",
  },
  clients: {
    title: "Clients",
    eyebrow: "Client workspace",
    description:
      "Client workspace routing is ready for conversion, onboarding, contacts, activity, files, projects, payments, meetings, and reports.",
    phase: "Phase 2",
    route: "/clients",
    requiredControls: ["client list", "workspace tabs", "health badge", "activity timeline"],
    serverBoundary: "ClientService through ClientRepository",
  },
  "operations/projects": {
    title: "Projects",
    eyebrow: "Operations",
    description:
      "Project routes are registered for client-linked delivery work with owner, team, schedule, health, priority, and Drive linkage.",
    phase: "Phase 3",
    route: "/operations/projects",
    requiredControls: controls.table,
    serverBoundary: "ProjectService through ProjectRepository",
  },
  "operations/tasks": {
    title: "Tasks",
    eyebrow: "Operations",
    description:
      "Task routes are registered for assignment, status workflow, due dates, comments, time tracking, and employee-scoped work views.",
    phase: "Phase 3",
    route: "/operations/tasks",
    requiredControls: controls.table,
    serverBoundary: "TaskService through TaskRepository",
  },
  "operations/workload": {
    title: "Workload",
    eyebrow: "Operations",
    description:
      "Workload routing is ready for capacity summaries derived from authorized tasks and projects without opaque utilization scoring.",
    phase: "Phase 3",
    route: "/operations/workload",
    requiredControls: ["employee rows", "priority distribution", "overdue counts", "week filter"],
    serverBoundary: "WorkloadReportService through task and project repositories",
  },
  "content/items": {
    title: "Content",
    eyebrow: "Production",
    description:
      "Content routing is registered for Reelkraft's production workflow from idea through publish with Drive version links.",
    phase: "Phase 4",
    route: "/content/items",
    requiredControls: controls.board,
    serverBoundary: "ContentWorkflowService through ContentRepository",
  },
  "content/calendar": {
    title: "Content Calendar",
    eyebrow: "Production",
    description:
      "The publishing calendar route is ready for date-based content rendering and calendar-linked review deadlines.",
    phase: "Phase 4",
    route: "/content/calendar",
    requiredControls: ["calendar grid", "platform filters", "publish markers", "review queue"],
    serverBoundary: "ContentCalendarService through ContentRepository",
  },
  "content/approvals": {
    title: "Approvals",
    eyebrow: "Production",
    description:
      "Approval routing is registered for permission-aware internal and client review actions with audit history.",
    phase: "Phase 4",
    route: "/content/approvals",
    requiredControls: ["approval queue", "revision dialog", "notes field", "audit trail"],
    serverBoundary: "ContentWorkflowService through ContentRepository and AuditLogRepository",
  },
  "team/employees": {
    title: "Employees",
    eyebrow: "Team",
    description:
      "Employee administration routing is ready for active/deactivated users, manager assignment, departments, and role metadata.",
    phase: "Phase 1",
    route: "/team/employees",
    requiredControls: controls.admin,
    serverBoundary: "EmployeeService through EmployeeRepository",
  },
  "team/invitations": {
    title: "Invitations",
    eyebrow: "Team",
    description:
      "Invitation routing is ready for pending, accepted, expired, and revoked invitation lifecycle events.",
    phase: "Phase 1",
    route: "/team/invitations",
    requiredControls: ["invitation form", "status filters", "revoke confirmation", "audit timeline"],
    serverBoundary: "InvitationService through InvitationRepository",
  },
  "team/permissions": {
    title: "Permissions",
    eyebrow: "Team",
    description:
      "Permission routing is ready for reviewing server-enforced role capabilities and future admin-controlled permission changes.",
    phase: "Phase 1",
    route: "/team/permissions",
    requiredControls: controls.admin,
    serverBoundary: "AuthorizationService through role policy definitions",
  },
  finance: {
    title: "Finance",
    eyebrow: "Business operations",
    description:
      "Finance routing is reserved for restricted invoice, payment, outstanding, and overdue calculations using INR-safe numeric storage.",
    phase: "Phase 5",
    route: "/finance",
    requiredControls: ["invoice table", "payment drawer", "amount fields", "restricted filters"],
    serverBoundary: "FinanceService through FinanceRepository and PaymentRepository",
  },
  hr: {
    title: "HR",
    eyebrow: "Business operations",
    description:
      "HR routing is registered for lightweight employee records, leave status, and workload visibility without payroll scope.",
    phase: "Phase 5",
    route: "/hr",
    requiredControls: ["HR profile", "department filters", "leave status", "access guard"],
    serverBoundary: "HrService through EmployeeRepository",
  },
  calendar: {
    title: "Calendar",
    eyebrow: "Scheduling",
    description:
      "Calendar routing is ready for CRM meetings, shoots, reviews, deadlines, and duplicate-safe Google Calendar event linkage.",
    phase: "Phase 5",
    route: "/calendar",
    requiredControls: ["calendar view", "meeting form", "attendee picker", "entity link"],
    serverBoundary: "CalendarService through MeetingRepository",
  },
  files: {
    title: "Files",
    eyebrow: "Google Drive",
    description:
      "Files routing is registered for metadata-only Drive references, least-privilege access checks, and entity file linkage.",
    phase: "Phase 1",
    route: "/files",
    requiredControls: ["file list", "Drive link", "entity filters", "permission badge"],
    serverBoundary: "DriveService through DriveGateway",
  },
  reports: {
    title: "Reports",
    eyebrow: "Reporting",
    description:
      "Reporting routes are registered for sales, operations, content, and client summaries with explicit date ranges and filters.",
    phase: "Phase 5",
    route: "/reports",
    requiredControls: ["date filters", "metric cards", "export guard", "source links"],
    serverBoundary: "ReportService through module repositories",
  },
  notifications: {
    title: "Notifications",
    eyebrow: "Coordination",
    description:
      "Notification routing is ready for unread counts, mark-read behavior, deep links, and integration delivery status.",
    phase: "Phase 3",
    route: "/notifications",
    requiredControls: ["notification list", "mark read", "entity links", "delivery status"],
    serverBoundary: "NotificationService through NotificationRepository",
  },
  "audit-logs": {
    title: "Audit Logs",
    eyebrow: "Governance",
    description:
      "Audit log routing is registered for immutable security and business activity history with restricted search and filtering.",
    phase: "Phase 1",
    route: "/audit-logs",
    requiredControls: ["audit table", "user filter", "action filter", "entity search"],
    serverBoundary: "AuditService through AuditLogRepository",
  },
  settings: {
    title: "Settings",
    eyebrow: "Administration",
    description:
      "Settings routing is ready for non-secret business configuration. Secrets remain in environment-managed systems.",
    phase: "Phase 1",
    route: "/settings",
    requiredControls: ["settings sections", "validation", "destructive confirmations", "audit events"],
    serverBoundary: "SettingsService through SettingsRepository",
  },
};

export default async function DashboardCatchAllPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const key = slug?.join("/") ?? "dashboard";
  const moduleDefinition = modules[key];

  if (!moduleDefinition) {
    notFound();
  }

  if (key === "dashboard") {
    return <DashboardOverview moduleDefinition={moduleDefinition} />;
  }

  return <ModulePage module={moduleDefinition} />;
}

function DashboardOverview({
  moduleDefinition,
}: {
  moduleDefinition: ModuleDefinition;
}) {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm font-medium text-muted-foreground">
            {moduleDefinition.eyebrow}
          </div>
          <h1 className="mt-1 text-2xl font-semibold md:text-3xl">
            {moduleDefinition.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {moduleDefinition.description}
          </p>
        </div>
        <Badge tone="success">Protected shell</Badge>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Authentication", "Auth.js Google Workspace OAuth"],
          ["Security", "Active employee session and RBAC"],
          ["Data", "Google Sheets repository adapters"],
          ["Drive", "Shared Drive metadata gateway"],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
          <CardTitle>Phase Gates Implemented</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {[
                "Dashboard routes require an active Reelkraft employee session",
                "Admin invitation and employee access changes are authorized server-side",
                "Google Sheets schema and repository adapters are in place",
                "Shared Drive metadata is resolved through a server-side gateway",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Status Constants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {activePipelineStages.map((stage) => (
                <Badge key={stage} tone="neutral">
                  {stage}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
