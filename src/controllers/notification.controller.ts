import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { BloodRequestNotification } from '../types';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
    // Bind methods
    this.createBloodRequest = this.createBloodRequest.bind(this);
    this.getUserNotifications = this.getUserNotifications.bind(this);
    this.markAsRead = this.markAsRead.bind(this);
    this.getUnreadCount = this.getUnreadCount.bind(this);
    this.deleteNotification = this.deleteNotification.bind(this);
    this.getActiveBloodRequests = this.getActiveBloodRequests.bind(this);
  }

  // Create blood request and send notifications
  async createBloodRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data: BloodRequestNotification = req.body;

      // Validate required fields (hospitalName and location will be fetched from user profile)
      const requiredFields = [
        'bloodType',
        'unitsNeeded',
        'urgency',
        'patientCondition',
        'contactPerson',
        'contactPhone',
        'expiryDate',
      ];

      const missingFields = requiredFields.filter(
        (field) => !data[field as keyof BloodRequestNotification]
      );

      if (missingFields.length > 0) {
        res.status(400).json({
          status: 'error',
          message: `Missing required fields: ${missingFields.join(', ')}`,
        });
        return;
      }

      // Get hospital info from authenticated user
      if (!req.user) {
        res.status(401).json({
          status: 'error',
          message: 'Authentication required',
        });
        return;
      }

      // Fetch hospital profile to get hospitalName and location
      const hospitalProfile = await this.notificationService.getHospitalProfile(req.user.userId);
      
      // Merge hospital info with request data
      const completeData = {
        ...data,
        hospitalId: req.user.userId,
        hospitalName: hospitalProfile.hospitalName,
        location: hospitalProfile.address,
      };

      const result = await this.notificationService.createBloodRequest(completeData);

      res.status(201).json({
        status: 'success',
        message: 'Blood request created and notifications sent successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all notifications for a user
  async getUserNotifications(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;

      // Note: userId can be either a UUID or an integer index (for testing)
      // The service layer will resolve it appropriately

      const notifications = await this.notificationService.getUserNotifications(
        userId
      );

      res.status(200).json({
        status: 'success',
        message: 'Notifications retrieved successfully',
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark notification as read
  async markAsRead(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'Unauthorized',
        });
        return;
      }

      await this.notificationService.markAsRead(id, userId);

      res.status(200).json({
        status: 'success',
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  // Get unread notification count
  async getUnreadCount(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;

      // Note: userId can be either a UUID or an integer index (for testing)
      // The service layer will resolve it appropriately

      const count = await this.notificationService.getUnreadCount(userId);

      res.status(200).json({
        status: 'success',
        message: 'Unread count retrieved successfully',
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete notification
  async deleteNotification(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'Unauthorized',
        });
        return;
      }

      await this.notificationService.deleteNotification(id, userId);

      res.status(200).json({
        status: 'success',
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all active blood requests
  async getActiveBloodRequests(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const requests = await this.notificationService.getActiveBloodRequests();

      res.status(200).json({
        status: 'success',
        message: 'Active blood requests retrieved successfully',
        data: requests,
      });
    } catch (error) {
      next(error);
    }
  }
}
