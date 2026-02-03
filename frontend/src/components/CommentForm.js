import React, { useState } from 'react';
import { apiFetch } from '../api';

export default function CommentForm({ postId, onCommentAdded }) {
  const [content, setContent] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!content) return;
    try {
      await apiFetch(`/api/comments/${postId}`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      setContent('');
      if (onCommentAdded) onCommentAdded();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        placeholder="Write a comment..."
        value={content}
        onChange={e => setContent(e.target.value)}
        required
        rows={3}
      />
      <button type="submit">Add Comment</button>
    </form>
  );
}
