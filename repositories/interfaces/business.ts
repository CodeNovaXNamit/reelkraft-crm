import type { WriteRepository } from "@/repositories/interfaces/base";
import type { FinanceRecord, Meeting, Notification, Payment } from "@/types/domain";

export type NotificationRecord = Notification;

export type FinanceRepository = WriteRepository<
  FinanceRecord,
  Partial<FinanceRecord>,
  Partial<FinanceRecord>
>;

export type PaymentRepository = WriteRepository<
  Payment,
  Partial<Payment>,
  Partial<Payment>
>;

export interface MeetingRepository
  extends WriteRepository<Meeting, Partial<Meeting>, Partial<Meeting>> {
  findByGoogleEventId(googleCalendarEventId: string): Promise<Meeting | null>;
}

export interface NotificationRepository {
  listUnread(recipientUserId: string): Promise<NotificationRecord[]>;
  markRead(id: string, recipientUserId: string): Promise<NotificationRecord>;
}
