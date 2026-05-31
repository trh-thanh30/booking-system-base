import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '@/module/notification/repository/notification.repository';

@Injectable()
export class MarkAllNotificationsReadUseCase {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  execute(userId: string) {
    return this.notificationRepository.markAllAsRead(userId);
  }
}
