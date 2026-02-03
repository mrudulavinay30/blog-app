import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../api';
import Navbar from '../components/Navbar';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ title, content }),
      });
      navigate('/home');
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) return <p>You must be logged in</p>;

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
        <h2>Create Post</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 10 }}
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            style={{ width: '100%', height: 150, marginBottom: 10 }}
          />
          <button type="submit">Create</button>
        </form>
      </div>
    </>
  );
}
