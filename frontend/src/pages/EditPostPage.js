import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../api';

export default function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        const post = await apiFetch(`/posts/${id}`);
        setTitle(post.title);
        setContent(post.content);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchPost();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, content }),
      });
      navigate('/home');
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) return <p>You must be logged in</p>;

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>Edit Post</h2>
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
        <button type="submit">Update</button>
      </form>
    </div>
  );
}
