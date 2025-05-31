import { Router } from 'express';
import { UserManagementController } from '../controllers/user-management.controller';
import { auth } from '../middleware/auth.middleware';
import { adminAuth } from '../middleware/admin.middleware';

const router = Router();
const userManagementController = new UserManagementController();

// Test endpoint (no auth required for debugging)
router.get('/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ message: 'User management routes are working!' });
});

// Simple endpoint to test database connection (no auth)
router.get('/test-db', async (req, res) => {
  try {
    console.log('Testing database connection...');
    const { UserModel } = require('../models/user.model');
    const result = await UserModel.findAll();
    console.log('Database test result:', result.length, 'users found');
    res.json({ 
      message: 'Database connection working', 
      userCount: result.length,
      users: result.map((u: any) => ({ id: u.id, username: u.username, email: u.email }))
    });
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({ 
      message: 'Database connection failed', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// All user management routes require authentication and admin privileges
router.use(auth);
router.use(adminAuth);

// Get all users
router.get('/users', userManagementController.getAllUsers);

// Get banned users
router.get('/users/banned', userManagementController.getBannedUsers);

// Ban a user
router.post('/users/:userId/ban', userManagementController.banUser);

// Unban a user
router.post('/users/:userId/unban', userManagementController.unbanUser);

export default router; 