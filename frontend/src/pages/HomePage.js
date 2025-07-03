// frontend/src/pages/HomePage.js

import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  TextField,
  Button,
  IconButton,
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import RepeatIcon from '@mui/icons-material/Repeat';
import { AuthContext } from '../context/AuthContext';
import { api } from '../api';

const HomePage = () => {
  const { user, accessToken } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostText, setNewPostText] = useState('');
  const [newCommentTextByPostId, setNewCommentTextByPostId] = useState({});
  const [commentsByPostId, setCommentsByPostId] = useState({});

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('/posts/');
        setPosts(response.data);
      } catch (error) {
        console.error('Ошибка загрузки постов:', error);
      }
    };

    const fetchPopularPosts = async () => {
      try {
        const response = await api.get('/posts/popular/');
        setPopularPosts(response.data);
      } catch (error) {
        console.error('Ошибка загрузки популярных постов:', error);
      }
    };

    Promise.all([fetchPosts(), fetchPopularPosts()]).finally(() => setLoading(false));
  }, []);

  const handleAddPost = async () => {
    if (!newPostText.trim()) return;
    if (!accessToken) {
      alert('Войдите в аккаунт, чтобы публиковать');
      return;
    }
    try {
      await api.post(
        '/posts/',
        { content: newPostText },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setNewPostText('');
      const response = await api.get('/posts/');
      setPosts(response.data);
    } catch (error) {
      console.error('Ошибка при добавлении поста:', error);
    }
  };

  const handleLike = async (postId) => {
    if (!accessToken) {
      alert('Войдите, чтобы ставить лайки');
      return;
    }
    try {
      await api.post(
        `/posts/${postId}/like/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const response = await api.get('/posts/');
      setPosts(response.data);
    } catch (error) {
      console.error('Ошибка при лайке:', error);
    }
  };

  const handleRepost = async (postId) => {
    if (!accessToken) {
      alert('Войдите, чтобы делать репосты');
      return;
    }
    try {
      await api.post(
        `/posts/${postId}/repost/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const response = await api.get('/posts/');
      setPosts(response.data);
    } catch (error) {
      console.error('Ошибка при репосте:', error);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const response = await api.get(`/posts/${postId}/comments/`);
      setCommentsByPostId((prev) => ({ ...prev, [postId]: response.data }));
    } catch (error) {
      console.error('Ошибка загрузки комментариев:', error);
    }
  };

  const handleAddComment = async (postId) => {
    const text = newCommentTextByPostId[postId];
    if (!text || !text.trim()) return;

    if (!accessToken) {
      alert('Для комментирования нужно войти в аккаунт');
      return;
    }

    try {
      await api.post(
        `/posts/${postId}/comments/`,
        { text }, // исправлено на text, как в модели
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      fetchComments(postId);
      setNewCommentTextByPostId((prev) => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Ошибка добавления комментария:', error);
      alert('Ошибка при добавлении комментария');
    }
  };

  if (loading)
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Загрузка...</Typography>
      </Container>
    );

  return (
    <Container maxWidth="md" sx={{ mt: 4, display: 'flex', gap: 3 }}>
      <Box sx={{ flex: 2 }}>
        <Typography variant="h4" fontWeight="bold" mb={2}>
          Привет{user ? `, ${user.username}` : ''}!
        </Typography>

        {user && (
          <Box mb={4}>
            <TextField
              label="Что нового?"
              multiline
              rows={3}
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              fullWidth
            />
            <Button variant="contained" sx={{ mt: 1 }} onClick={handleAddPost}>
              Отправить
            </Button>
          </Box>
        )}

        {posts.map((post) => (
          <Paper key={post.id} sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {post.author_username}:
            </Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>{post.content}</Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
              <IconButton
                size="small"
                onClick={() => handleLike(post.id)}
                color={post.liked_by_user ? 'primary' : 'default'}
              >
                <ThumbUpIcon />
              </IconButton>
              <Typography variant="body2">{post.like_count}</Typography>

              <IconButton size="small" onClick={() => handleRepost(post.id)}>
                <RepeatIcon />
              </IconButton>
              <Typography variant="body2">{post.repost_count || 0}</Typography>

              <Typography variant="body2" sx={{ ml: 'auto' }}>
                Комментариев: {post.comment_count}
              </Typography>
            </Box>

            <Box mt={2}>
              <Button size="small" onClick={() => fetchComments(post.id)}>
                Показать комментарии
              </Button>
              {(commentsByPostId[post.id] || []).map((comment) => (
                <Box
                  key={comment.id}
                  sx={{ pl: 2, mt: 1, borderLeft: '2px solid #ccc' }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    {comment.author_username}:
                  </Typography>
                  <Typography variant="body2">{comment.text}</Typography>
                </Box>
              ))}

              {user && (
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Добавить комментарий"
                    value={newCommentTextByPostId[post.id] || ''}
                    onChange={(e) =>
                      setNewCommentTextByPostId((prev) => ({
                        ...prev,
                        [post.id]: e.target.value,
                      }))
                    }
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleAddComment(post.id)}
                  >
                    Отправить
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        ))}
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography variant="h5" mb={2}>
          Популярные публикации
        </Typography>
        {popularPosts.length === 0 ? (
          <Typography>Пока нет популярных публикаций.</Typography>
        ) : (
          popularPosts.map((post) => (
            <Paper key={post.id} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {post.author_username}:
              </Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{post.content}</Typography>
              <Typography variant="caption" color="text.secondary">
                Лайков: {post.like_count} | Репостов: {post.repost_count || 0} | Комментариев:{' '}
                {post.comment_count}
              </Typography>
            </Paper>
          ))
        )}
      </Box>
    </Container>
  );
};

export default HomePage;
