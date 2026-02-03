import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

export default function ProfilePage() {
  const { user, token } = useContext(AuthContext);
  const [profile, setProfile] = useState({ username: '', bio: '' });
  const [editing, setEditing] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  // Fetch user profile info
  useEffect(() => {
    if (user) {
      fetch(`http://localhost:3003/api/posts/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          console.log('📥 Profile info received:', data);
          setProfile(data);
          setBioInput(data.bio || '');
        })
        .catch(error => {
          console.error('❌ Error fetching profile info:', error);
        });
    }
  }, [user, token]);

  // Fetch only posts by the logged-in user
  useEffect(() => {
    if (user && user.id) {
      console.log('🔍 Fetching posts for user:', { userId: user.id, username: user.username });
      fetch(`http://localhost:3003/api/posts?author_id=${user.id}&userId=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          console.log('📡 Profile API response status:', res.status);
          return res.json();
        })
        .then(data => {
          console.log('📥 Profile received data from API:', { data, isArray: Array.isArray(data) });
          // Ensure data is an array
          const postsArray = Array.isArray(data) ? data : [];
          setPosts(postsArray);
          // Update liked posts map
          const likedMap = {};
          postsArray.forEach(post => {
            likedMap[post.id] = post.is_liked;
          });
          setLikedPosts(likedMap);
        })
        .catch(error => {
          console.error('❌ Error fetching user posts:', error);
          setPosts([]);
          setLikedPosts({});
        });
    } else {
      console.log('⚠️ No user or user.id available for profile posts');
    }
  }, [user, token]);

  // Bio editing
  const handleEditBio = () => setEditing(true);
  const handleSaveBio = async () => {
    try {
      console.log('💾 Saving bio:', bioInput);
      const response = await fetch(`http://localhost:3003/api/posts/profile/bio`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ bio: bioInput })
      });
      
      if (response.ok) {
        console.log('✅ Bio saved successfully');
        setProfile({ ...profile, bio: bioInput });
        setEditing(false);
      } else {
        console.error('❌ Error saving bio:', response.status);
        const errorText = await response.text();
        console.error('Error details:', errorText);
      }
    } catch (error) {
      console.error('❌ Error saving bio:', error);
    }
  };

  // Post actions
  const handleEdit = (postId) => navigate(`/edit/${postId}`);
  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    await fetch(`http://localhost:3003/api/posts/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setPosts(posts.filter(p => p.id !== postId));
  };

  const handleSave = async (postId) => {
  try {
    const post = posts.find(p => p.id === postId);
    const isSaved = post.is_saved;

    if (isSaved) {
      await fetch(`http://localhost:3003/api/posts/${postId}/save`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
    } else {
      await fetch(`http://localhost:3003/api/posts/${postId}/save`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    // update local state
    setPosts(posts.map(p =>
      p.id === postId ? { ...p, is_saved: !isSaved } : p
    ));
  } catch (err) {
    console.error("❌ Error toggling save:", err);
  }
};

  const handleLike = async (postId) => {
    const isLiked = likedPosts[postId];
    console.log("🩶 Profile like button clicked!", { postId, isLiked, userId: user?.id });
    
    if (!user?.id) {
      console.error("No user ID available for like operation");
      return;
    }

    try {
      if (isLiked) {
        console.log("🔄 Unliking post...");
        await fetch(`http://localhost:3003/api/posts/${postId}/unlike`, {
          method: "DELETE",
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ userId: user.id })
        });
      } else {
        console.log("🔄 Liking post...");
        await fetch(`http://localhost:3003/api/posts/${postId}/like`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ userId: user.id })
        });
      }

      console.log("✅ Like operation successful, updating local state...");
      // Update local state
      setLikedPosts(prev => ({
        ...prev,
        [postId]: !prev[postId]
      }));
      setPosts(postList =>
        postList.map(post =>
          post.id === postId
            ? { ...post, likes: (post.likes || 0) + (isLiked ? -1 : 1) }
            : post
        )
      );
    } catch (err) {
      console.error("❌ Error toggling like:", err);
    }
  };
  const handleComment = (postId) => {
    navigate(`/post/${postId}`);
  };

  const searchPosts = async (query) => {
    if (!query || query.trim() === '') {
      setIsSearching(false);
      // Reload user's posts when search is cleared
      if (user) {
        fetch(`http://localhost:3003/api/posts?author_id=${user.id}&userId=${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            console.log('📥 Profile received data from API:', { data, isArray: Array.isArray(data) });
            const postsArray = Array.isArray(data) ? data : [];
            setPosts(postsArray);
            const likedMap = {};
            postsArray.forEach(post => {
              likedMap[post.id] = post.is_liked;
            });
            setLikedPosts(likedMap);
          });
      }
      return;
    }

    setIsSearching(true);
    try {
      const data = await fetch(`http://localhost:3003/api/posts/search?q=${encodeURIComponent(query)}&userId=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json());
      
      console.log('🔍 Profile search results:', { query, data, isArray: Array.isArray(data) });
      
      const postsArray = Array.isArray(data) ? data : [];
      // Filter to only show user's posts in search results
      const userPosts = postsArray.filter(post => post.author_id === user.id);
      setPosts(userPosts);

      const likedMap = {};
      userPosts.forEach(post => {
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
<button onClick={() => navigate('/saved-posts')}>View Saved Posts</button>

  if (!user) return <p>Loading...</p>;

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
        <h2>Profile</h2>
        <p><strong>Username:</strong> {user.username}</p>
        <div style={{ margin: '18px 0' }}>
          <strong>Bio:</strong>
          {editing ? (
            <div>
              <textarea
                value={bioInput}
                onChange={e => setBioInput(e.target.value)}
                rows={3}
                style={{ width: '100%', marginTop: 8 }}
              />
              <button onClick={handleSaveBio} style={{ marginTop: 6 }}>Save</button>
              <button onClick={() => { setBioInput(profile.bio); setEditing(false); }} style={{ marginLeft: 8, marginTop: 6 }}>Cancel</button>
            </div>
          ) : (
            <div style={{ marginTop: 8 }}>
              <span>{profile.bio || <em>No bio added.</em>}</span>
              <button onClick={handleEditBio} style={{ marginLeft: 12 }}>Edit</button>
            </div>
          )}
        </div>
        <h3>My Posts</h3>
        <SearchBar onSearch={handleSearch} placeholder="Search your posts..." />
        {isSearching && (
          <p className="search-status">
            Searching for: "{searchTerm}"
          </p>
        )}
        {!posts || posts.length === 0 ? (
          <p>{isSearching ? 'No posts found matching your search.' : "You haven't created any posts yet."}</p>
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
                  <span
    onClick={() => handleSave(post.id)}
    style={{
      cursor: 'pointer',
      color: post.is_saved ? 'gold' : '#888'
    }}
  >
    {post.is_saved ? '⭐ Unsave' : '☆ Save'}
  </span>
                </div>
                <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleEdit(post.id)}>Edit</button>
                  <button onClick={() => handleDelete(post.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
