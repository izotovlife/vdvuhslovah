// frontend/src/pages/PostPage.js

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import PostItem from '../components/PostItem';
import CommentForm from '../components/CommentForm';
import CommentsList from '../components/CommentsList';

const PostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    axios.get(`/api/posts/${id}/`) // Получение данных поста по id
      .then(res => setPost(res.data))
      .catch(err => console.error(err));

    axios.get(`/api/posts/${id}/comments/`) // Получение комментариев поста
      .then(res => setComments(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const handleNewComment = newComment => {
    setComments(prev => [newComment, ...prev]);
  };

  if (!post) return <div>Загрузка публикации...</div>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <PostItem post={post} />

      <h3 style={{ marginTop: 30 }}>Комментарии</h3>
      <CommentForm postId={post.id} onAdd={handleNewComment} />
      <CommentsList comments={comments} />
    </div>
  );
};

export default PostPage;
