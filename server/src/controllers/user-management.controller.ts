import { Request, Response } from 'express';
import { UserManagementService } from '../services/user-management.service';
import { BadRequestError, NotFoundError } from '../utils/errorTypes';

export class UserManagementController {
  private userManagementService: UserManagementService;

  constructor() {
    this.userManagementService = new UserManagementService();
  }

  getAllUsers = async (req: Request, res: Response) => {
    try {
      console.log('getAllUsers called - Starting user fetch...');
      const users = await this.userManagementService.getAllUsers();
      console.log('Users fetched successfully:', users.length, 'users found');
      console.log('First user (if any):', users[0]);
      res.json(users);
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  getBannedUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.userManagementService.getBannedUsers();
      res.json(users);
    } catch (error) {
      console.error('Error in getBannedUsers:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  banUser = async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const adminId = req.userId;

      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const result = await this.userManagementService.banUser(userId, adminId);
      
      if (result) {
        res.json({ message: 'User banned successfully' });
      } else {
        res.status(400).json({ message: 'Failed to ban user' });
      }
    } catch (error) {
      console.error('Error in banUser:', error);
      
      if (error instanceof BadRequestError) {
        return res.status(400).json({ message: error.message });
      }
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  unbanUser = async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);

      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const result = await this.userManagementService.unbanUser(userId);
      
      if (result) {
        res.json({ message: 'User unbanned successfully' });
      } else {
        res.status(400).json({ message: 'Failed to unban user' });
      }
    } catch (error) {
      console.error('Error in unbanUser:', error);
      
      if (error instanceof BadRequestError) {
        return res.status(400).json({ message: error.message });
      }
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: 'Internal server error' });
    }
  };
} 