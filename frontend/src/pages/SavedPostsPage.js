import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function SavedPostsPage() {
  const { token } = useContext(AuthContext);
  const [savedPosts, setSavedPosts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3003/api/posts/saved', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSavedPosts(data))
      .catch(err => console.error('❌ Error fetching saved posts:', err));
  }, [token]);

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
        <h2>Saved Posts</h2>
        {savedPosts.length === 0 ? (
          <p>No saved posts yet.</p>
        ) : (
          savedPosts.map(post => (
            <div key={post.id} style={{ marginBottom: 20 }}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <small>by {post.author}</small>
            </div>
          ))
        )}
      </div>
    </>
  );
}
