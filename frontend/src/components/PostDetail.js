import React, { useState, useEffect, useContext } from 'react';
import { apiFetch } from '../api';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import { AuthContext } from '../context/AuthContext';

export default function PostDetail({ postId }) {
  const [post, setPost] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!postId) return;
    apiFetch(`/api/posts/${postId}`)
      .then(setPost)
      .catch(console.error);
  }, [postId]);

  if (!post) return <p>Select a post to view details</p>;

  return (
    <div>
      <h2>{post.title}</h2>
      <p>Content{post.author}</p>
      <p>{post.content}</p>
      <h3>Comments</h3>
      <CommentList postId={postId} />
      {user && <CommentForm postId={postId} />}
    </div>
  );
}
