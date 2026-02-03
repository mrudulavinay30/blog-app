import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';

export default function EditPost({ post, onCancel, onSave }) {
  const [form, setForm] = useState({ title: '', content: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (post) setForm({ title: post.title, content: post.content });
  }, [post]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async e => {
    e.preventDefault();
    try {
      await apiFetch(`/posts/${post.id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      if (onSave) onSave();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!post) return null;

  return (
    <form onSubmit={handleSave}>
      <h2>Edit Post</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input name="title" value={form.title} onChange={handleChange} required />
      <textarea name="content" value={form.content} onChange={handleChange} required />
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
}
