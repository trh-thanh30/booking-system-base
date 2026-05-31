import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from '@/module/notification/repository/notification.repository';

@Injectable()
export class MarkNotificationReadUseCase {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(notificationId: string, userId: string) {
    const recipient = await this.notificationRepository.findUserRecipient(
      notificationId,
      userId,
    );

    if (!recipient) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepository.markAsRead(notificationId, userId);

    return this.notificationRepository.findUserRecipient(
      notificationId,
      userId,
    );
  }
}
