import { Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { AuthGuard } from "../auth/guards/auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JWTPayload } from "src/utils/type";


@Controller("notifications")
export class NotificationController {

  constructor(private readonly notificationService: NotificationService) { };

  @Get()
  @UseGuards(AuthGuard)
  async getNotifications(@CurrentUser() payload: JWTPayload) {
    return this.notificationService.getNotifications(payload.id);
  }


  @Patch(':id/read')
  @UseGuards(AuthGuard)
  async markNotificationAsRead(@Param('id') id: string, @CurrentUser() payload: JWTPayload) {
    const notificationId = parseInt(id, 10);
    await this.notificationService.markNotificationAsRead(notificationId, payload.id);
    return { message: 'Notification marked as read' };
  }
}