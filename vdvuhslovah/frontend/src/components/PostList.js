// src/components/PostList.js

import React, { useState } from 'react';
import { Card, CardContent, Typography, IconButton, Button, Box } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import RepeatIcon from '@mui/icons-material/Repeat';
import PostForm from './PostForm';
import api from '../api'; // Импортируем наш экземпляр axios

export default function PostList({ posts, onUpdatePosts }) {
  const [error, setError] = useState(null);
  const [retweetParentId, setRetweetParentId] = useState(null);

  const handleLike = async (id) => {
    try {
      // Используем наш экземпляр api вместо axios
      await api.post(`/posts/${id}/like/`, {});
      onUpdatePosts();
    } catch (error) {
      console.error(error);
      setError('Ошибка при лайке');
    }
  };

  const handleRetweet = async (id) => {
    try {
      // Используем наш экземпляр api вместо axios
      await api.post(`/posts/`, { parent: id, content: '' });
      onUpdatePosts();
    } catch (error) {
      console.error(error);
      setError('Ошибка при ретвите');
    }
  };

  const openRetweetWithComment = (id) => {
    setRetweetParentId(id);
  };

  const closeRetweetForm = () => {
    setRetweetParentId(null);
  };

  return (
    <Box>
      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      {retweetParentId && (
        <PostForm
          parentId={retweetParentId}
          onPostCreated={() => {
            onUpdatePosts();
            closeRetweetForm();
          }}
          onCancel={closeRetweetForm}
        />
      )}

      {posts.map((post) => (
        <Card key={post.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" color="textSecondary">
              {post.author_username}
              {post.parent && ' (ретвит)'}
            </Typography>
            <Typography>{post.content}</Typography>

            {post.parent && (
              <Card variant="outlined" sx={{ bgcolor: '#f0f0f0', p: 1, mt: 1, mb: 1 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  {post.parent.author_username}
                </Typography>
                <Typography>{post.parent.content}</Typography>
                <Typography variant="caption" color="textSecondary">
                  Лайков: {post.parent.like_count}
                </Typography>
              </Card>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <IconButton onClick={() => handleLike(post.id)} aria-label="like">
                <ThumbUpIcon />
                <Typography sx={{ ml: 0.5 }}>{post.like_count}</Typography>
              </IconButton>

              <Button
                size="small"
                startIcon={<RepeatIcon />}
                onClick={() => handleRetweet(post.id)}
              >
                Ретвит
              </Button>

              <Button
                size="small"
                onClick={() => openRetweetWithComment(post.id)}
              >
                Ретвит с комментарием
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}