import { pool } from '../db/pool.js';

export const addComment = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const user_id = req.user.id;
  await pool.query(
    'INSERT INTO comments (content, user_id, post_id) VALUES ($1,$2,$3)',
    [content, user_id, postId]
  );
  res.json({ message: 'Comment added!' });
};

export const getComments = async (req, res) => {
  const { postId } = req.params;
  const result = await pool.query(
    'SELECT c.*, u.username FROM comments c JOIN users u ON u.id=c.user_id WHERE post_id=$1 ORDER BY c.created_at DESC',
    [postId]
  );
  res.json(result.rows);
};
// Edit a comment
export const editComment = async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  // Validate user owns comment
  const result = await pool.query('SELECT user_id FROM comments WHERE id=$1', [commentId]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'Comment not found' });
  if (result.rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  
  await pool.query('UPDATE comments SET content=$1 WHERE id=$2', [content, commentId]);
  res.json({ message: 'Comment updated!' });
};

// Delete a comment
export const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  // Validate user owns comment
  const result = await pool.query('SELECT user_id FROM comments WHERE id=$1', [commentId]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'Comment not found' });
  if (result.rows[0].user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  
  await pool.query('DELETE FROM comments WHERE id=$1', [commentId]);
  res.json({ message: 'Comment deleted!' });
};


// ✅ Get Comment Count for a Post
export const getCommentCount = async (req, res) => {
  const { postId } = req.params;
  try {
    const result = await pool.query(
      'SELECT COUNT(*) AS count FROM comments WHERE post_id = $1',
      [postId]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    console.error('Error fetching comment count:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
