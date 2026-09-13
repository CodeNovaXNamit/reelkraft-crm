import type { NotificationRepository } from "@/repositories/interfaces/operations";
import type { Notification } from "@/types/domain";

export class NotificationService {
  constructor(private readonly notifications: NotificationRepository) {}

  create(input: Omit<Notification, "id" | "createdAt" | "deliveryStatus">) {
    return this.notifications.create(input);
  }

  listForRecipient(recipientUserId: string) {
    return this.notifications.listForRecipient(recipientUserId);
  }
}
