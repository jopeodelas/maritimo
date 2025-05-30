import { Router } from 'express';
import { 
  getDiscussions, 
  createDiscussion, 
  getDiscussionComments,
  addComment,
  deleteDiscussion
} from '../controllers/discussions.controller';
import { auth } from '../middleware/auth.middleware';

const router = Router();

// Get all discussions with optional sorting
router.get('/', getDiscussions);

// Create a new discussion (requires authentication)
router.post('/', auth, createDiscussion);

// Get comments for a specific discussion
router.get('/:id/comments', getDiscussionComments);

// Add a comment to a discussion (requires authentication)
router.post('/:id/comments', auth, addComment);

// Delete a discussion (requires authentication and ownership)
router.delete('/:id', auth, deleteDiscussion);

export default router; 