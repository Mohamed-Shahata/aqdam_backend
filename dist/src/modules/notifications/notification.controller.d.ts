import { NotificationService } from "./notification.service";
import { JWTPayload } from "src/utils/type";
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    getNotifications(payload: JWTPayload): Promise<any[]>;
    markNotificationAsRead(id: string, payload: JWTPayload): Promise<{
        message: string;
    }>;
}
