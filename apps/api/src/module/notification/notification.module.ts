import { Module } from '@nestjs/common';
import { PrismaModule } from '@/database/prisma/prisma.module';
import { NotificationController } from '@/module/notification/notification.controller';
import { NotificationRepository } from '@/module/notification/repository/notification.repository';
import { NotificationSchedulerService } from '@/module/notification/service/notification-scheduler.service';
import { NotificationService } from '@/module/notification/service/notification.service';
import { CreateAdminNotificationUseCase } from '@/module/notification/use-cases/create-admin-notification.use-case';
import { CreateSystemNotificationUseCase } from '@/module/notification/use-cases/create-system-notification.use-case';
import { GetUserNotificationUseCase } from '@/module/notification/use-cases/get-user-notification.use-case';
import { ListUserNotificationsUseCase } from '@/module/notification/use-cases/list-user-notifications.use-case';
import { MarkAllNotificationsReadUseCase } from '@/module/notification/use-cases/mark-all-notifications-read.use-case';
import { MarkNotificationReadUseCase } from '@/module/notification/use-cases/mark-notification-read.use-case';
import { PublishScheduledNotificationsUseCase } from '@/module/notification/use-cases/publish-scheduled-notifications.use-case';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationSchedulerService,
    NotificationRepository,
    CreateAdminNotificationUseCase,
    CreateSystemNotificationUseCase,
    ListUserNotificationsUseCase,
    GetUserNotificationUseCase,
    MarkNotificationReadUseCase,
    MarkAllNotificationsReadUseCase,
    PublishScheduledNotificationsUseCase,
  ],
  exports: [
    NotificationService,
    CreateSystemNotificationUseCase,
    PublishScheduledNotificationsUseCase,
  ],
})
export class NotificationModule {}
