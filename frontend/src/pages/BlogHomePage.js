import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

export default function BlogHomePage() {
  const [posts, setPosts] = useState([]);
  const { user, token } = useContext(AuthContext);
  const [likedPosts, setLikedPosts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('http://localhost:3003/api/posts', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch posts');
        const data = await res.json();
        setPosts(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchPosts();
  }, [token]);

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      const res = await fetch(`http://localhost:3003/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete post');
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (postId) => {
    navigate(`/edit/${postId}`);
  };

  // Like toggling per post (frontend only!)
  const handleLike = (postId) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }));
    setPosts((postList) =>
      postList.map((post) =>
        post.id === postId
          ? { ...post, likes: (post.likes || 0) + (likedPosts[postId] ? -1 : 1) }
          : post
      )
    );
  };

  // Clickable comment icon
  const handleComment = (postId) => {
    navigate(`/post/${postId}`);
  };

  return (
    <>
      <Navbar />
      <div>
        <h2 style={{ textAlign: 'center', margin: '20px 0' }}>All Posts</h2>
        {posts.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No posts found.</p>
        ) : (
          <div className="post-grid">
            {posts.map(post => (
              <div className="post-card" key={post.id}>
                <div className="post-title">
                  <Link to={`/post/${post.id}`} style={{ color: '#234', textDecoration: 'none' }}>
                    {post.title}
                  </Link>
                </div>
                <div className="post-meta">by {post.author}</div>
                <div className="post-content">
                  {post.content.slice(0, 100)}...
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, margin: '12px 0' }}>
                  <span
                    onClick={() => handleLike(post.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      color: likedPosts[post.id] ? 'red' : '#888'
                    }}
                  >
                    {likedPosts[post.id] ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    <span style={{ marginLeft: 4 }}>{post.likes || 0}</span>
                  </span>
                  <span
                    onClick={() => handleComment(post.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      color: '#347ca9'
                    }}
                  >
                    <ChatBubbleOutlineIcon />
                    <span style={{ marginLeft: 4 }}>{post.comments?.length || 0}</span>
                  </span>
                </div>

                {user && user.username === post.author && (
                  <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleEdit(post.id)}>Edit</button>
                    <button onClick={() => handleDelete(post.id)}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
