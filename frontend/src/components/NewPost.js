import React, { useState, useContext } from 'react';
import { apiFetch } from '../api';
import { AuthContext } from '../context/AuthContext';

export default function NewPost({ onPostCreated }) {
  const [form, setForm] = useState({ title: '', content: '' });
  const { user } = useContext(AuthContext);
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create a post.');
      return;
    }
    try {
      await apiFetch('/posts', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm({ title: '', content: '' });
      if (onPostCreated) onPostCreated();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>New Post</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
      <textarea name="content" placeholder="Content" value={form.content} onChange={handleChange} required />
      <button type="submit">Create Post</button>
    </form>
  );
}
