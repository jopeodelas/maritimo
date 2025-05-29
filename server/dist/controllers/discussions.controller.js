"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addComment = exports.getDiscussionComments = exports.createDiscussion = exports.getDiscussions = void 0;
const discussion_model_1 = require("../models/discussion.model");
const comment_model_1 = require("../models/comment.model");
const errorTypes_1 = require("../utils/errorTypes");
const getDiscussions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sort = 'newest' } = req.query;
        const discussions = yield discussion_model_1.DiscussionModel.getAll(sort);
        res.json(discussions);
    }
    catch (error) {
        next(error);
    }
});
exports.getDiscussions = getDiscussions;
const createDiscussion = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Creating discussion - Request body:', req.body);
        console.log('Creating discussion - User:', req.user);
        const { title, description } = req.body;
        const userId = req.user.id;
        if (!title || !description) {
            console.log('Missing title or description:', { title, description });
            throw new errorTypes_1.BadRequestError('Title and description are required');
        }
        if (title.length > 200) {
            throw new errorTypes_1.BadRequestError('Title must be 200 characters or less');
        }
        if (description.length > 2000) {
            throw new errorTypes_1.BadRequestError('Description must be 2000 characters or less');
        }
        console.log('Creating discussion with:', { userId, title: title.trim(), description: description.trim() });
        const discussion = yield discussion_model_1.DiscussionModel.create(userId, title.trim(), description.trim());
        console.log('Discussion created successfully:', discussion);
        res.status(201).json(discussion);
    }
    catch (error) {
        console.error('Error in createDiscussion:', error);
        next(error);
    }
});
exports.createDiscussion = createDiscussion;
const getDiscussionComments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const discussionId = parseInt(req.params.id);
        if (isNaN(discussionId)) {
            throw new errorTypes_1.BadRequestError('Invalid discussion ID');
        }
        // Check if discussion exists
        const discussion = yield discussion_model_1.DiscussionModel.getById(discussionId);
        if (!discussion) {
            throw new errorTypes_1.NotFoundError('Discussion not found');
        }
        const comments = yield comment_model_1.CommentModel.getByDiscussionId(discussionId);
        res.json(comments);
    }
    catch (error) {
        next(error);
    }
});
exports.getDiscussionComments = getDiscussionComments;
const addComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const discussionId = parseInt(req.params.id);
        const { content } = req.body;
        const userId = req.user.id;
        if (isNaN(discussionId)) {
            throw new errorTypes_1.BadRequestError('Invalid discussion ID');
        }
        if (!content) {
            throw new errorTypes_1.BadRequestError('Comment content is required');
        }
        if (content.length > 1000) {
            throw new errorTypes_1.BadRequestError('Comment must be 1000 characters or less');
        }
        // Check if discussion exists
        const discussion = yield discussion_model_1.DiscussionModel.getById(discussionId);
        if (!discussion) {
            throw new errorTypes_1.NotFoundError('Discussion not found');
        }
        const comment = yield comment_model_1.CommentModel.create(discussionId, userId, content.trim());
        // Update discussion's last activity
        yield discussion_model_1.DiscussionModel.updateLastActivity(discussionId);
        res.status(201).json(comment);
    }
    catch (error) {
        next(error);
    }
});
exports.addComment = addComment;
