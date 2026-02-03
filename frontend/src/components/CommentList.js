import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';

export default function CommentList({ postId }) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    console.log("Fetching comments for post:", postId);

    if (!postId) return;
    apiFetch(`/api/comments/${postId}`)
      .then(setComments)
      .catch(console.error);
  }, [postId]);

  return (
    <>
      {comments.map(c => (
        <div key={c.id} style={{ borderBottom: '1px solid #ddd', marginBottom: 5 }}>
          <p><strong>{c.username}</strong>: {c.content}</p>
        </div>
      ))}
    </>
  );
}
