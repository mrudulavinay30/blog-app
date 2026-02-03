import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
} from '../controllers/postController.js';
import { likePost, unlikePost, getPostLikes, getProfile, updateBio, searchPosts } from '../controllers/postController.js';
import { savePost, unsavePost, getSavedPosts } from "../controllers/postController.js";



const router = express.Router();
router.get('/',verifyToken, getAllPosts);
router.get('/search', searchPosts);
router.get('/profile', verifyToken, getProfile);
router.put('/profile/bio', verifyToken, updateBio);
router.get('/:id', getSinglePost);
router.post('/', verifyToken, createPost);
router.put('/:id', verifyToken, updatePost);
router.delete('/:id', verifyToken, deletePost);
router.post('/:id/like', verifyToken, likePost);
router.delete('/:id/unlike', verifyToken, unlikePost);
router.get('/:id/likes', getPostLikes);




// Save/unsave routes
router.post("/:postId/save", verifyToken, savePost);
router.delete("/:postId/save", verifyToken, unsavePost);

// Get all saved posts by logged-in user
router.get("/saved", verifyToken, getSavedPosts);
router.post('/api/posts/:postId/like', verifyToken, async (req, res) => {
  const { postId } = req.params;
  const userId = req.body.userId || req.user.id; // from token middleware
  try {
    await pool.query(
      'INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [postId, userId]
    );
    res.status(200).json({ message: 'Liked!' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});


export default router;
