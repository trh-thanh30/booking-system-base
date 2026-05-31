import { Injectable } from '@nestjs/common';
import { ListNotificationsDto } from '@/module/notification/dto/list-notifications.dto';
import { NotificationRepository } from '@/module/notification/repository/notification.repository';

@Injectable()
export class ListUserNotificationsUseCase {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  execute(userId: string, query: ListNotificationsDto) {
    return this.notificationRepository.listForUser(userId, query);
  }
}
