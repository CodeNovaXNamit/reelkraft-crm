import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  FileStack,
  FolderOpen,
  Gauge,
  Handshake,
  IndianRupee,
  LayoutDashboard,
  ListChecks,
  LucideIcon,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Video,
} from "lucide-react";
import { hasPermission } from "@/lib/permissions/roles";
import type { PermissionResource, Role } from "@/types/domain";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  resource: PermissionResource;
  children?: NavigationItem[];
};

export const adminNavigation: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, resource: "dashboard" },
  {
    label: "CRM",
    href: "/crm/leads",
    icon: Handshake,
    resource: "leads",
    children: [
      { label: "Leads", href: "/crm/leads", icon: Search, resource: "leads" },
      { label: "Pipeline", href: "/crm/pipeline", icon: Gauge, resource: "pipeline" },
      { label: "Pipeline Audit", href: "/crm/audit", icon: ShieldCheck, resource: "audit_logs" },
    ],
  },
  { label: "Clients", href: "/clients", icon: BriefcaseBusiness, resource: "clients" },
  {
    label: "Operations",
    href: "/operations/projects",
    icon: ClipboardList,
    resource: "projects",
    children: [
      { label: "Projects", href: "/operations/projects", icon: FolderOpen, resource: "projects" },
      { label: "Tasks", href: "/operations/tasks", icon: ListChecks, resource: "tasks" },
      { label: "Workload", href: "/operations/workload", icon: Gauge, resource: "tasks" },
    ],
  },
  {
    label: "Content",
    href: "/content/items",
    icon: Video,
    resource: "content",
    children: [
      { label: "Content", href: "/content/items", icon: Video, resource: "content" },
      { label: "Calendar", href: "/content/calendar", icon: CalendarDays, resource: "content" },
      { label: "Approvals", href: "/content/approvals", icon: ShieldCheck, resource: "content" },
    ],
  },
  {
    label: "Team",
    href: "/team/employees",
    icon: Users,
    resource: "employees",
    children: [
      { label: "Employees", href: "/team/employees", icon: Users, resource: "employees" },
      { label: "Invitations", href: "/team/invitations", icon: Bell, resource: "invitations" },
      { label: "Permissions", href: "/team/permissions", icon: ShieldCheck, resource: "settings" },
    ],
  },
  { label: "Finance", href: "/finance", icon: IndianRupee, resource: "finance" },
  { label: "HR", href: "/hr", icon: Users, resource: "hr" },
  { label: "Calendar", href: "/calendar", icon: CalendarDays, resource: "calendar" },
  { label: "Files", href: "/files", icon: FileStack, resource: "files" },
  { label: "Reports", href: "/reports", icon: Gauge, resource: "reports" },
  { label: "Notifications", href: "/notifications", icon: Bell, resource: "notifications" },
  { label: "Audit Logs", href: "/audit-logs", icon: ShieldCheck, resource: "audit_logs" },
  { label: "Settings", href: "/settings", icon: Settings, resource: "settings" },
];

export function visibleNavigationForRole(role: Role) {
  return adminNavigation
    .filter((item) => hasPermission(role, item.resource, "view"))
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) =>
        hasPermission(role, child.resource, "view"),
      ),
    }));
}
