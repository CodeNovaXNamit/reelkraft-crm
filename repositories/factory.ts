import { GoogleDriveGateway } from "@/repositories/google-sheets/drive-gateway";
import { GoogleSheetsAuditLogRepository } from "@/repositories/google-sheets/audit-log-repository";
import {
  GoogleSheetsFinanceRepository,
  GoogleSheetsMeetingRepository,
  GoogleSheetsPaymentRepository,
} from "@/repositories/google-sheets/business-repositories";
import { GoogleSheetsContentRepository } from "@/repositories/google-sheets/content-repository";
import {
  GoogleSheetsClientRepository,
  GoogleSheetsDealRepository,
  GoogleSheetsLeadRepository,
  GoogleSheetsPipelineMovementRepository,
} from "@/repositories/google-sheets/crm-repositories";
import {
  GoogleSheetsNotificationRepository,
  GoogleSheetsProjectRepository,
  GoogleSheetsTaskRepository,
} from "@/repositories/google-sheets/operations-repositories";
import {
  GoogleSheetsEmployeeRepository,
  GoogleSheetsInvitationRepository,
} from "@/repositories/google-sheets/team-repositories";
import { GoogleSheetsClient } from "@/repositories/google-sheets/client";

export function createRepositoryContext() {
  const sheetsClient = new GoogleSheetsClient();

  return {
    sheetsClient,
    employees: new GoogleSheetsEmployeeRepository(sheetsClient),
    invitations: new GoogleSheetsInvitationRepository(sheetsClient),
    leads: new GoogleSheetsLeadRepository(sheetsClient),
    deals: new GoogleSheetsDealRepository(sheetsClient),
    clients: new GoogleSheetsClientRepository(sheetsClient),
    pipelineMovements: new GoogleSheetsPipelineMovementRepository(sheetsClient),
    projects: new GoogleSheetsProjectRepository(sheetsClient),
    tasks: new GoogleSheetsTaskRepository(sheetsClient),
    content: new GoogleSheetsContentRepository(sheetsClient),
    finance: new GoogleSheetsFinanceRepository(sheetsClient),
    payments: new GoogleSheetsPaymentRepository(sheetsClient),
    meetings: new GoogleSheetsMeetingRepository(sheetsClient),
    notifications: new GoogleSheetsNotificationRepository(sheetsClient),
    auditLogs: new GoogleSheetsAuditLogRepository(sheetsClient),
    drive: new GoogleDriveGateway(),
  };
}
