// src/components/PostList.js

import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, IconButton } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import api from '../api';

export default function PostList() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      setError(null);
      const res = await api.get('/posts/');
      setPosts(res.data);
    } catch (error) {
      console.error('Ошибка при загрузке постов:', error);
      setError('Ошибка при загрузке постов. Проверьте, что вы вошли в систему.');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (id) => {
    try {
      setError(null);
      await api.post(`/posts/${id}/like/`);
      fetchPosts(); // обновляем список после лайка
    } catch (error) {
      console.error('Ошибка при лайке:', error);
      setError('Ошибка при постановке лайка. Попробуйте позже.');
    }
  };

  return (
    <div>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      {posts.map((post) => (
        <Card key={post.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle2">{post.author_username}</Typography>
            <Typography>{post.content}</Typography>
            <IconButton onClick={() => handleLike(post.id)} aria-label="like">
              <ThumbUpIcon />
              <Typography sx={{ ml: 1 }}>{post.like_count}</Typography>
            </IconButton>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
