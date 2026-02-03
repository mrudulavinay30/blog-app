import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { addComment, getComments,editComment,deleteComment } from '../controllers/commentController.js';
import { getCommentCount } from '../controllers/commentController.js'
const router = express.Router();
router.get('/:postId', getComments);
router.post('/:postId', verifyToken, addComment);
router.put('/:commentId', verifyToken, editComment);
router.delete('/:commentId', verifyToken, deleteComment);
router.get('/count/:postId', getCommentCount);
export default router;
