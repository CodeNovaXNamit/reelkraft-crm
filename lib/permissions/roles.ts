import {
  permissionActions,
  permissionResources,
  type PermissionAction,
  type PermissionResource,
  type Role,
} from "@/types/domain";

type PermissionMatrix = Record<
  Role,
  Partial<Record<PermissionResource, PermissionAction[]>>
>;

const allActions = [...permissionActions];
const viewOnly: PermissionAction[] = ["view"];
const workActions: PermissionAction[] = ["view", "create", "edit", "assign"];
const contentActions: PermissionAction[] = [
  "view",
  "create",
  "edit",
  "assign",
  "approve",
];

function founderPermissions() {
  return Object.fromEntries(
    permissionResources.map((resource) => [resource, allActions]),
  ) as Record<PermissionResource, PermissionAction[]>;
}

export const rolePermissions: PermissionMatrix = {
  FOUNDER_ADMIN: founderPermissions(),
  OPERATIONS_HEAD: {
    dashboard: viewOnly,
    clients: ["view", "edit"],
    projects: workActions,
    tasks: workActions,
    content: contentActions,
    employees: viewOnly,
    calendar: workActions,
    files: viewOnly,
    reports: viewOnly,
    notifications: viewOnly,
    audit_logs: ["view", "audit"],
  },
  SALES_FINANCE: {
    dashboard: viewOnly,
    leads: ["view", "create", "edit", "assign"],
    deals: ["view", "create", "edit", "assign"],
    pipeline: ["view", "edit", "assign", "audit"],
    clients: ["view", "create", "edit"],
    finance: ["view", "create", "edit", "export"],
    calendar: workActions,
    files: viewOnly,
    reports: viewOnly,
    notifications: viewOnly,
  },
  HR_ACCOUNT_MANAGER: {
    dashboard: viewOnly,
    clients: ["view", "edit"],
    projects: ["view", "create", "edit", "assign"],
    tasks: workActions,
    employees: viewOnly,
    hr: ["view", "edit"],
    calendar: workActions,
    files: viewOnly,
    reports: viewOnly,
    notifications: viewOnly,
  },
  VIDEO_DESIGN_HEAD: {
    dashboard: viewOnly,
    clients: viewOnly,
    projects: ["view", "edit"],
    tasks: workActions,
    content: contentActions,
    calendar: viewOnly,
    files: viewOnly,
    notifications: viewOnly,
  },
  VIDEO_EDITOR: {
    dashboard: viewOnly,
    clients: viewOnly,
    projects: viewOnly,
    tasks: ["view", "edit"],
    content: ["view", "edit"],
    calendar: viewOnly,
    files: viewOnly,
    notifications: viewOnly,
  },
  EMPLOYEE: {
    dashboard: viewOnly,
    projects: viewOnly,
    tasks: ["view", "edit"],
    content: viewOnly,
    calendar: viewOnly,
    files: viewOnly,
    notifications: viewOnly,
  },
};

export function hasPermission(
  role: Role,
  resource: PermissionResource,
  action: PermissionAction,
) {
  return rolePermissions[role][resource]?.includes(action) ?? false;
}
