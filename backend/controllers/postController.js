import { pool } from '../db/pool.js';

export const createPost = async (req, res) => {
  const { title, content } = req.body;
  const author_id = req.user.id;
  await pool.query('INSERT INTO posts (title, content, author_id) VALUES ($1,$2,$3)', [
    title,
    content,
    author_id,
  ]);
  res.json({ message: 'Post created!' });
};

export const getAllPosts = async (req, res) => {
  const userId = req.user?.id || 0;
  const authorId = req.query.author_id;

  try {
    let query = `
      SELECT p.*, 
             u.username as author,
             COALESCE(COUNT(pl.post_id), 0) AS likes,
             BOOL_OR(pl.user_id = $1) AS is_liked
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN post_likes pl ON p.id = pl.post_id
    `;
    
    const params = [userId];
    
    if (authorId) {
      query += ` WHERE p.author_id = $2`;
      params.push(authorId);
    }
    
    query += ` GROUP BY p.id, u.username ORDER BY p.id DESC`;

    const { rows } = await pool.query(query, params);
    console.log('📊 Posts query result:', { 
      query, 
      params, 
      rowCount: rows.length, 
      sampleRow: rows[0] 
    });
    res.json(rows);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
};



export const getSinglePost = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(`
      SELECT p.*, 
             u.username as author,
             COALESCE(COUNT(pl.post_id), 0) AS likes
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN post_likes pl ON p.id = pl.post_id
      WHERE p.id = $1
      GROUP BY p.id, u.username
    `, [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Error fetching post' });
  }
};

export const updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  await pool.query('UPDATE posts SET title=$1, content=$2 WHERE id=$3', [title, content, id]);
  res.json({ message: 'Post updated!' });
};

export const deletePost = async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM posts WHERE id=$1', [id]);
  res.json({ message: 'Post deleted!' });
};
// Like a post
export const likePost = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  console.log("📩 Like request received:", { postId: id, userId });
  
  if (!userId) {
    console.error("❌ userId missing in request body!");
    return res.status(400).json({ message: "userId missing" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO post_likes (post_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (post_id, user_id) DO NOTHING
       RETURNING *`,
      [id, userId]
    );

    console.log("✅ Like insert result:", result.rows);

    res.status(200).json({ message: "Post liked successfully!" });
  } catch (error) {
    console.error("Error inserting like:", error);
    res.status(500).json({ message: "Error liking post" });
  }
};



// Unlike a post
export const unlikePost = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  console.log("📩 Unlike request received:", { postId: id, userId });
  try {
    await pool.query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [id, userId]);
    res.json({ message: 'Post unliked' });
  } catch (error) {
    console.error("Error removing like:", error);
    res.status(500).json({ message: "Error unliking post" });
  }
};

// Get like count for a post
export const getPostLikes = async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT COUNT(*) FROM post_likes WHERE post_id=$1', [id]);
  res.json({ likes: parseInt(rows[0].count, 10) });
};
// Get profile info
export const getProfile = async (req, res) => {
  const userId = req.user.id;
  const { rows } = await pool.query('SELECT username, bio FROM users WHERE id=$1', [userId]);
  res.json(rows[0]);
};

// Update bio
export const updateBio = async (req, res) => {
  const userId = req.user?.id;
  const { bio } = req.body;

  console.log('🧠 Update bio request:', { userId, bio });  // ✅ Add this

  if (!userId) {
    return res.status(400).json({ message: 'No user ID found in token' });
  }

  try {
    await pool.query('UPDATE users SET bio=$1 WHERE id=$2', [bio, userId]);
    res.json({ message: 'Bio updated' });
  } catch (error) {
    console.error('Error updating bio:', error);
    res.status(500).json({ message: 'Error updating bio' });
  }
};


// Search posts
export const searchPosts = async (req, res) => {
  const { q } = req.query; // search query
  const userId = req.query.userId || 0;
  
  if (!q || q.trim() === '') {
    return res.json([]);
  }

  try {
    const searchTerm = `%${q.trim()}%`;
    const { rows } = await pool.query(`
      SELECT p.*, 
             u.username as author,
             COALESCE(COUNT(pl.post_id), 0) AS likes,
             BOOL_OR(pl.user_id = $1) AS is_liked
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN post_likes pl ON p.id = pl.post_id
      WHERE p.title ILIKE $2 OR p.content ILIKE $2
      GROUP BY p.id, u.username
      ORDER BY p.id DESC
    `, [userId, searchTerm]);
    
    console.log('🔍 Search query result:', { 
      searchTerm: q, 
      resultCount: rows.length 
    });
    
    res.json(rows);
  } catch (error) {
    console.error('Error searching posts:', error);
    res.status(500).json({ message: 'Error searching posts' });
  }
};
export const savePost = async (req, res) => {
  const userId = req.user.id;
  const { postId } = req.params;

  try {
    await pool.query(
      `INSERT INTO saved_posts (user_id, post_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, post_id) DO NOTHING`,
      [userId, postId]
    );

    res.status(200).json({ message: "Post saved successfully" });
  } catch (err) {
    console.error("❌ Error saving post:", err);
    res.status(500).json({ message: "Error saving post" });
  }
};

// ✅ Unsave a post
export const unsavePost = async (req, res) => {
  const userId = req.user.id;
  const { postId } = req.params;

  try {
    await pool.query(
      `DELETE FROM saved_posts WHERE user_id = $1 AND post_id = $2`,
      [userId, postId]
    );

    res.status(200).json({ message: "Post unsaved successfully" });
  } catch (err) {
    console.error("❌ Error unsaving post:", err);
    res.status(500).json({ message: "Error unsaving post" });
  }
};

// ✅ Get all saved posts of logged-in user
export const getSavedPosts = async (req, res) => {
  const userId = req.user.id;

  try {
    const { rows } = await pool.query(
      `SELECT p.*, u.username AS author
       FROM saved_posts s
       JOIN posts p ON s.post_id = p.id
       JOIN users u ON p.author_id = u.id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching saved posts:", err);
    res.status(500).json({ message: "Error fetching saved posts" });
  }
};