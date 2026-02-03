import React, { useState, useEffect, useContext } from 'react';
import { apiFetch } from '../api';
import { AuthContext } from '../context/AuthContext';
import SearchBar from '../components/SearchBar';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useNavigate } from 'react-router-dom';

export default function SearchPage() {
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);

  const searchPosts = async (query) => {
    if (!query || query.trim() === '') {
      setIsSearching(false);
      setHasSearched(false);
      setPosts([]);
      setLikedPosts({});
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    try {
      const data = await apiFetch(`/api/posts/search?q=${encodeURIComponent(query)}&userId=${currentUser?.id || 0}`);
      console.log('🔍 Search results:', { query, data, isArray: Array.isArray(data) });
      
      const postsArray = Array.isArray(data) ? data : [];
      setPosts(postsArray);

      // update liked posts map
      const likedMap = {};
      postsArray.forEach(post => {
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
      if (isLiked) {
        console.log("🔄 Unliking post...");
        await apiFetch(`/api/posts/${postId}/unlike`, {
          method: "DELETE",
          body: JSON.stringify({ userId: currentUser.id }),
        });
      } else {
        console.log("🔄 Liking post...");
        await apiFetch(`/api/posts/${postId}/like`, {
          method: "POST",
          body: JSON.stringify({ userId: currentUser.id }),
        });
      }

      console.log("✅ Like operation successful, refreshing search...");
      // Refresh search results after liking/unliking
      searchPosts(searchTerm);
    } catch (err) {
      console.error("❌ Error toggling like:", err);
    }
  };

  const handleComment = (postId) => {
    navigate(`/post/${postId}`);
  };

  return (
    <div style={{ padding: '20px', paddingBottom: '80px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Search Posts</h2>
      <SearchBar onSearch={handleSearch} placeholder="Search posts by title or content..." />
      
      {isSearching && (
        <p className="search-status">
          Searching for: "{searchTerm}"
        </p>
      )}
      
      {hasSearched && !isSearching && posts.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', marginTop: '20px' }}>
          No posts found matching "{searchTerm}"
        </p>
      )}
      
      {!hasSearched && (
        <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', marginTop: '20px' }}>
          Enter a search term to find posts
        </p>
      )}

      <div className="post-grid">
        {posts && posts.map((post, index) => (
          <div className="post-card" key={post.id}>
            <div className="post-title" onClick={() => navigate(`/post/${post.id}`)}>
              {post.title}
            </div>
            <div className="post-meta">By {post.author}</div>
            <div className="post-content">{post.content.slice(0, 100)}...</div>

            {/* Likes and Comments row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, margin: '12px 0' }}>
              <span
                onClick={() => handleLikeToggle(post.id, likedPosts[post.id])}
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: likedPosts[post.id] ? 'red' : '#888' }}
              >
                {likedPosts[post.id] ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                <span style={{ marginLeft: 4 }}>{post.likes || 0}</span>
              </span>

              <span
                onClick={() => handleComment(post.id)}
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#347ca9' }}
              >
                <ChatBubbleOutlineIcon />
                <span style={{ marginLeft: 4 }}>{post.comments?.length || 0}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
