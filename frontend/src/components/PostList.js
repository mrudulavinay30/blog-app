import React, { useState, useEffect, useContext } from 'react';
import { apiFetch } from '../api';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import SearchBar from './SearchBar';

export default function PostList({ onSelect, onEditDelete }) {
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);

  // ✅ Fetch posts + comment count + like state
  const fetchPosts = async () => {
    try {
      const data = await apiFetch(`api/posts?userId=${currentUser?.id || 0}`);
      console.log('📥 Received posts:', data);

      // Fetch comment count for each post
      const postsWithCounts = await Promise.all(
        data.map(async (post) => {
          try {
            const countRes = await apiFetch(`api/comments/count/${post.id}`);
            return { ...post, commentCount: countRes.count || 0 };
          } catch (err) {
            console.warn(`⚠️ Failed to fetch comment count for post ${post.id}`);
            return { ...post, commentCount: 0 };
          }
        })
      );

      setPosts(postsWithCounts);

      // Update liked posts map
      const likedMap = {};
      postsWithCounts.forEach(post => {
        likedMap[post.id] = post.is_liked; // from backend
      });
      setLikedPosts(likedMap);
    } catch (error) {
      console.error('❌ Error fetching posts:', error);
      setPosts([]);
      setLikedPosts({});
    }
  };

  // ✅ Search posts
  const searchPosts = async (query) => {
    if (!query || query.trim() === '') {
      setIsSearching(false);
      fetchPosts();
      return;
    }

    setIsSearching(true);
    try {
      const data = await apiFetch(`api/posts/search?q=${encodeURIComponent(query)}&userId=${currentUser?.id || 0}`);
      console.log('🔍 Search results:', data);

      // Fetch comment counts for search results
      const postsWithCounts = await Promise.all(
        data.map(async (post) => {
          const countRes = await apiFetch(`api/comments/count/${post.id}`);
          return { ...post, commentCount: countRes.count || 0 };
        })
      );

      setPosts(postsWithCounts);

      const likedMap = {};
      postsWithCounts.forEach(post => {
        likedMap[post.id] = post.is_liked;
      });
      setLikedPosts(likedMap);
    } catch (error) {
      console.error('Error searching posts:', error);
      setPosts([]);
      setLikedPosts({});
    }
  };

  const handleSearch = (query) => {
    setSearchTerm(query);
    searchPosts(query);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // ✅ Like toggle
  // ✅ Like toggle
const handleLikeToggle = async (postId, isLiked) => {
  console.log("🩶 Like button clicked!");
  console.log("postId:", postId);
  console.log("isLiked (before click):", isLiked);
  console.log("currentUser.id:", currentUser?.id);

  if (!currentUser?.id) {
    console.error("No user ID available for like operation");
    return;
  }

  try {
    const method = isLiked ? "DELETE" : "POST";
    const endpoint = isLiked ? "unlike" : "like";

    await apiFetch(`api/posts/${postId}/${endpoint}`, {
      method,
      body: JSON.stringify({ userId: currentUser.id }),
    });
    console.log("currentUser:", currentUser);

    console.log("✅ Like operation successful, refreshing posts...");

    // ❌ REMOVE this line:
    // fetchPosts();

    // ✅ ADD this optimized frontend update instead:
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !isLiked
    }));

    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, likes: p.likes + (isLiked ? -1 : 1) }
          : p
      )
    );

  } catch (err) {
    console.error("❌ Error toggling like:", err);
  }
};

const [liked, setLiked] = useState(false);

const handleLike = async (postId) => {
  try {
    // Optional: Optimistically update UI first
    setLiked(true);

    const res = await fetch(`http://localhost:3003/api/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      // Optionally send the user ID in the body if needed
      body: JSON.stringify({ userId: user.id })
    });
    if (!res.ok) throw new Error('Failed to like post');
    // You can update like count locally here if you want
  } catch (err) {
    setLiked(false); // revert on error
    alert(err.message);
  }
};


  const handleComment = (postId) => {
    navigate(`/post/${postId}`);
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>All Posts</h2>

      {/* 🔍 Search Bar */}
      <SearchBar onSearch={handleSearch} placeholder="Search posts by title or content..." />
      {isSearching && (
        <p className="search-status">
          Searching for: "{searchTerm}"
        </p>
      )}

      <div className="post-grid">
        {posts && posts.map((post, index) => {
          console.log("🔍 Rendering post:", post.id, post.title, "index:", index);
          return (
            <div className="post-card" key={post.id}>
              <div className="post-title" onClick={() => onSelect(post.id)}>
                {post.title}
              </div>
              <div className="post-meta">By {post.author}</div>
              <div className="post-content">{post.content.slice(0, 100)}...</div>

              {/* ❤️ Likes and 💬 Comments */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, margin: '12px 0' }}>
                {/* Like button */}
                <span
                  onClick={() => handleLikeToggle(post.id, likedPosts[post.id])}
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
  style={{
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: '1.6em',
    color: liked ? 'red' : 'grey'
  }}
  onClick={() => handleLike(post.id)}
  aria-label="Like"
  title="Like"
>
  ❤️
</span>
<span
  onClick={() => handleSave(post.id)}
  style={{
    cursor: 'pointer',
    color: post.is_saved ? 'gold' : '#888'
  }}
>
  {post.is_saved ? '⭐ Unsave' : '☆ Save'}
</span>


                {/* Comment icon with count */}
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
                  <span style={{ marginLeft: 4 }}>{post.commentCount || 0}</span>
                </span>
              </div>

              {onEditDelete && (
                <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                  <button onClick={() => onEditDelete('edit', post)}>Edit</button>
                  <button onClick={() => onEditDelete('delete', post)}>Delete</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
