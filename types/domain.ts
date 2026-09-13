export const roles = [
  "FOUNDER_ADMIN",
  "OPERATIONS_HEAD",
  "SALES_FINANCE",
  "HR_ACCOUNT_MANAGER",
  "VIDEO_DESIGN_HEAD",
  "VIDEO_EDITOR",
  "EMPLOYEE",
] as const;

export type Role = (typeof roles)[number];

export const permissionActions = [
  "view",
  "create",
  "edit",
  "delete",
  "assign",
  "approve",
  "export",
  "audit",
] as const;

export type PermissionAction = (typeof permissionActions)[number];

export const permissionResources = [
  "dashboard",
  "leads",
  "deals",
  "pipeline",
  "clients",
  "projects",
  "tasks",
  "content",
  "employees",
  "invitations",
  "finance",
  "hr",
  "calendar",
  "files",
  "reports",
  "notifications",
  "audit_logs",
  "settings",
] as const;

export type PermissionResource = (typeof permissionResources)[number];

export const pipelineStages = [
  "NEW_LEAD",
  "CONTACTED",
  "QUALIFIED",
  "DISCOVERY",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;

export type PipelineStage = (typeof pipelineStages)[number];

export const priorityLevels = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export type Priority = (typeof priorityLevels)[number];

export const taskStatuses = [
  "TO_DO",
  "IN_PROGRESS",
  "REVIEW",
  "REVISION",
  "APPROVED",
  "COMPLETED",
  "BLOCKED",
] as const;

export type TaskStatus = (typeof taskStatuses)[number];

export const projectHealthValues = ["ON_TRACK", "AT_RISK", "BLOCKED"] as const;

export type ProjectHealth = (typeof projectHealthValues)[number];

export const clientHealthValues = ["HEALTHY", "ATTENTION", "AT_RISK"] as const;

export type ClientHealth = (typeof clientHealthValues)[number];

export const contentStatuses = [
  "IDEA",
  "SCRIPT",
  "SHOOT",
  "EDITING",
  "INTERNAL_REVIEW",
  "CLIENT_REVIEW",
  "REVISION",
  "APPROVED",
  "SCHEDULED",
  "PUBLISHED",
] as const;

export type ContentStatus = (typeof contentStatuses)[number];

export type Actor = {
  id: string;
  email: string;
  role: Role;
  status: "ACTIVE" | "INACTIVE";
};

export type Employee = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  department?: string;
  managerId?: string;
  joiningDate?: string;
  status: "ACTIVE" | "INACTIVE";
  accessLevel?: string;
  leaveStatus?: string;
  workloadCapacity?: number;
  avatarUrl?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";

export type Invitation = {
  id: string;
  email: string;
  name: string;
  role: Role;
  department?: string;
  managerId?: string;
  accessLevel?: string;
  status: InvitationStatus;
  invitedBy: string;
  invitedAt: string;
  expiresAt?: string;
  acceptedAt?: string;
  revokedAt?: string;
};

export type AuditLog = {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  metadata?: string;
  createdAt: string;
};

export type Lead = {
  id: string;
  company: string;
  contactName: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  source?: string;
  serviceInterested?: string;
  dealValue?: number;
  ownerId: string;
  stage: PipelineStage;
  probability?: number;
  expectedCloseDate?: string;
  lastContact?: string;
  nextAction?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type Deal = {
  id: string;
  leadId: string;
  company: string;
  contactName?: string;
  ownerId: string;
  value: number;
  stage: PipelineStage;
  probability: number;
  expectedCloseDate?: string;
  lastContact?: string;
  nextAction?: string;
  wonAt?: string;
  lostAt?: string;
  lostReason?: string;
  convertedClientId?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type PipelineMovement = {
  id: string;
  dealId: string;
  leadId: string;
  previousStage: PipelineStage;
  newStage: PipelineStage;
  actorId: string;
  reason: string;
  notes?: string;
  dealValue: number;
  nextAction?: string;
  createdAt: string;
};

export type Client = {
  id: string;
  companyName: string;
  primaryContactName?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  website?: string;
  industry?: string;
  service?: string;
  accountManagerId?: string;
  sourceLeadId?: string;
  sourceDealId?: string;
  driveFolderId?: string;
  driveFolderUrl?: string;
  onboardingStatus?: string;
  health: ClientHealth;
  recurringValue?: number;
  renewalDate?: string;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type Project = {
  id: string;
  clientId: string;
  projectName: string;
  type?: string;
  ownerId: string;
  teamMemberIds: string[];
  startDate?: string;
  dueDate?: string;
  status: string;
  priority: Priority;
  budget?: number;
  health: ProjectHealth;
  description?: string;
  driveLink?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  clientId?: string;
  projectId?: string;
  assignedToId: string;
  createdBy: string;
  priority: Priority;
  status: TaskStatus;
  startDate?: string;
  dueDate?: string;
  estimatedTime?: number;
  actualTime?: number;
  driveLink?: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
};

export type Notification = {
  id: string;
  recipientUserId: string;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  link?: string;
  readAt?: string;
  createdAt: string;
  deliveryStatus: "PENDING" | "SENT" | "FAILED";
};

export type ContentItem = {
  id: string;
  clientId: string;
  accountId?: string;
  platform?: string;
  contentType?: string;
  topic?: string;
  pillar?: string;
  writerId?: string;
  designerId?: string;
  editorId?: string;
  reviewerId?: string;
  publishDate?: string;
  driveFileId?: string;
  driveFileUrl?: string;
  version?: string;
  status: ContentStatus;
  revisionNotes?: string;
  approvalNotes?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type MeetingType =
  | "CLIENT_MEETING"
  | "DISCOVERY_CALL"
  | "SHOOT"
  | "INTERNAL_REVIEW"
  | "CONTENT_DEADLINE"
  | "APPROVAL_MEETING"
  | "OTHER";

export type Meeting = {
  id: string;
  title: string;
  type?: MeetingType;
  clientId?: string;
  projectId?: string;
  taskId?: string;
  startAt: string;
  endAt: string;
  attendees?: string[];
  googleCalendarEventId?: string;
  meetingUrl?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type FinanceRecord = {
  id: string;
  clientId: string;
  invoiceNumber: string;
  amount: number;
  currency: "INR";
  status: "DRAFT" | "SENT" | "PARTIAL" | "PAID" | "OVERDUE";
  dueDate?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type Payment = {
  id: string;
  financeId: string;
  clientId: string;
  amount: number;
  paidAt: string;
  method?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
};
