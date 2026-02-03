import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../api';
import { AuthContext } from '../context/AuthContext';
import CommentForm from '../components/CommentForm';

export default function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const { user } = useContext(AuthContext);

  const fetchComments = async () => {
    try {
      const data = await apiFetch(`/api/comments/${id}`);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postData = await apiFetch(`/api/posts/${id}`);
        console.log('📥 PostDetail received post data:', postData);
        setPost(postData);
      } catch (error) {
        console.error('Error fetching post:', error);
        setPost(null);
      }
    };

    fetchPost();
    fetchComments();
  }, [id]);

  if (!post) return <p>Loading post...</p>;

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>{post.title}</h2>
      <p><em>By {post.author}</em></p>
      <p>{post.content}</p>

      <h3>Comments</h3>
      {user && <CommentForm postId={id} onCommentAdded={fetchComments} />}
      {comments.length === 0 && <p>No comments yet.</p>}
      <ul>
        {comments.map(c => (
          <li key={c.id}>{c.content} - <i>{c.username}</i></li>
        ))}
      </ul>
    </div>
  );
}
