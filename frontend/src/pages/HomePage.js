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
  Tooltip,
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import RepeatIcon from '@mui/icons-material/Repeat';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

const HomePage = () => {
  const { user, accessToken } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostText, setNewPostText] = useState('');
  const [newCommentTextByPostId, setNewCommentTextByPostId] = useState({});
  const [commentsByPostId, setCommentsByPostId] = useState({});
  const [showCommentsFor, setShowCommentsFor] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [showCommentInputFor, setShowCommentInputFor] = useState({}); // для отображения формы ввода комментария

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
    setLoadingComments((prev) => ({ ...prev, [postId]: true }));
    try {
      const response = await api.get(`/posts/${postId}/comments/`);
      setCommentsByPostId((prev) => ({ ...prev, [postId]: response.data }));
      setShowCommentsFor((prev) => ({ ...prev, [postId]: true }));
    } catch (error) {
      console.error('Ошибка загрузки комментариев:', error);
    } finally {
      setLoadingComments((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const toggleComments = (postId) => {
    if (showCommentsFor[postId]) {
      setShowCommentsFor((prev) => ({ ...prev, [postId]: false }));
    } else {
      if (!commentsByPostId[postId]) {
        fetchComments(postId);
      } else {
        setShowCommentsFor((prev) => ({ ...prev, [postId]: true }));
      }
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
        { content: text },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      await fetchComments(postId);
      setNewCommentTextByPostId((prev) => ({ ...prev, [postId]: '' }));
      // Можно закрыть форму ввода комментария после отправки, если хотите
      setShowCommentInputFor((prev) => ({ ...prev, [postId]: false }));
    } catch (error) {
      console.error('Ошибка добавления комментария:', error);
      alert('Ошибка при добавлении комментария');
    }
  };

  const toggleCommentInput = (postId) => {
    if (!user) {
      alert('Войдите в аккаунт, чтобы добавлять комментарии');
      return;
    }
    setShowCommentInputFor((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
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
          <Paper key={post.id} sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              {post.author_username}
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
              {post.content}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title="Лайк">
                <IconButton
                  size="small"
                  onClick={() => handleLike(post.id)}
                  color={post.liked_by_user ? 'primary' : 'default'}
                >
                  <ThumbUpIcon />
                </IconButton>
              </Tooltip>
              <Typography variant="body2">{post.like_count}</Typography>

              <Tooltip title="Репост">
                <IconButton size="small" onClick={() => handleRepost(post.id)}>
                  <RepeatIcon />
                </IconButton>
              </Tooltip>
              <Typography variant="body2">{post.repost_count || 0}</Typography>

              <Tooltip title="Добавить комментарий">
                <IconButton
                  size="small"
                  onClick={() => toggleCommentInput(post.id)}
                  color={showCommentInputFor[post.id] ? 'primary' : 'default'}
                >
                  <CommentIcon />
                </IconButton>
              </Tooltip>

              <Typography variant="body2" sx={{ ml: 'auto' }}>
                Комментариев: {post.comment_count}
              </Typography>
            </Box>

            {/* Форма для быстрого добавления комментария рядом с постом */}
            {showCommentInputFor[post.id] && (
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Напишите комментарий..."
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
                  endIcon={<SendIcon />}
                  onClick={() => handleAddComment(post.id)}
                >
                  Отправить
                </Button>
              </Box>
            )}

            {/* Кнопка и список комментариев */}
            {post.comment_count > 0 && (
              <Box mt={2}>
                <Button
                  size="small"
                  onClick={() => toggleComments(post.id)}
                  disabled={loadingComments[post.id]}
                  sx={{ mb: 1 }}
                >
                  {loadingComments[post.id]
                    ? 'Загрузка...'
                    : showCommentsFor[post.id]
                    ? 'Скрыть комментарии'
                    : 'Показать комментарии'}
                </Button>

                {showCommentsFor[post.id] && !loadingComments[post.id] && (
                  <>
                    {(commentsByPostId[post.id] || []).map((comment) => (
                      <Paper
                        key={comment.id}
                        variant="outlined"
                        sx={{
                          p: 1,
                          mb: 1,
                          borderRadius: 1,
                          backgroundColor: '#f9f9f9',
                          ml: 2,
                        }}
                      >
                        <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.3 }}>
                          {comment.user.username}
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {comment.content}
                        </Typography>
                      </Paper>
                    ))}
                  </>
                )}
              </Box>
            )}
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
            <Paper key={post.id} sx={{ p: 2, mb: 2, borderRadius: 2, boxShadow: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                {post.author_username}
              </Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>{post.content}</Typography>
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

