import { Request, Response, NextFunction } from 'express';
import { DiscussionModel } from '../models/discussion.model';
import { CommentModel } from '../models/comment.model';
import { BadRequestError, NotFoundError } from '../utils/errorTypes';

export const getDiscussions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sort = 'newest' } = req.query;
    const discussions = await DiscussionModel.getAll(sort as string);
    res.json(discussions);
  } catch (error) {
    next(error);
  }
};

export const createDiscussion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Creating discussion - Request body:', req.body);
    console.log('Creating discussion - User:', (req as any).user);
    
    const { title, description } = req.body;
    const userId = (req as any).user.id;

    if (!title || !description) {
      console.log('Missing title or description:', { title, description });
      throw new BadRequestError('Title and description are required');
    }

    if (title.length > 200) {
      throw new BadRequestError('Title must be 200 characters or less');
    }

    if (description.length > 2000) {
      throw new BadRequestError('Description must be 2000 characters or less');
    }

    console.log('Creating discussion with:', { userId, title: title.trim(), description: description.trim() });
    const discussion = await DiscussionModel.create(userId, title.trim(), description.trim());
    console.log('Discussion created successfully:', discussion);
    
    res.status(201).json(discussion);
  } catch (error) {
    console.error('Error in createDiscussion:', error);
    next(error);
  }
};

export const getDiscussionComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const discussionId = parseInt(req.params.id);
    
    if (isNaN(discussionId)) {
      throw new BadRequestError('Invalid discussion ID');
    }

    // Check if discussion exists
    const discussion = await DiscussionModel.getById(discussionId);
    if (!discussion) {
      throw new NotFoundError('Discussion not found');
    }

    const comments = await CommentModel.getByDiscussionId(discussionId);
    res.json(comments);
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const discussionId = parseInt(req.params.id);
    const { content } = req.body;
    const userId = (req as any).user.id;

    if (isNaN(discussionId)) {
      throw new BadRequestError('Invalid discussion ID');
    }

    if (!content) {
      throw new BadRequestError('Comment content is required');
    }

    if (content.length > 1000) {
      throw new BadRequestError('Comment must be 1000 characters or less');
    }

    // Check if discussion exists
    const discussion = await DiscussionModel.getById(discussionId);
    if (!discussion) {
      throw new NotFoundError('Discussion not found');
    }

    const comment = await CommentModel.create(discussionId, userId, content.trim());
    
    // Update discussion's last activity
    await DiscussionModel.updateLastActivity(discussionId);
    
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

export const deleteDiscussion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const discussionId = parseInt(req.params.id);
    const userId = (req as any).user.id;

    if (isNaN(discussionId)) {
      throw new BadRequestError('Invalid discussion ID');
    }

    // Check if discussion exists and if the user is the author
    const discussion = await DiscussionModel.getById(discussionId);
    if (!discussion) {
      throw new NotFoundError('Discussion not found');
    }

    if (discussion.author_id !== userId) {
      throw new BadRequestError('Only the author can delete this discussion');
    }

    await DiscussionModel.delete(discussionId);
    
    res.json({ message: 'Discussion deleted successfully' });
  } catch (error) {
    next(error);
  }
}; 