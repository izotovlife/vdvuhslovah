// frontend/src/pages/HomePage.js

// Основная страница приложения. Показывает список постов, форму для создания постов,
// позволяет просматривать и комментировать посты. Обновляет локальное состояние после лайка и репоста без полной перезагрузки.

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
  Avatar,
  Link,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import RepeatIcon from '@mui/icons-material/Repeat';
import CommentIcon from '@mui/icons-material/Comment';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import CommentsList from '../components/CommentsList';

const PostPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[4],
  backgroundColor: theme.palette.background.paper,
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[8],
  },
}));

const AuthorInfo = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  gap: theme.spacing(1),
}));

const PostContent = styled(Typography)(({ theme }) => ({
  whiteSpace: 'pre-wrap',
  marginBottom: theme.spacing(2),
  fontWeight: 500,
  color: theme.palette.text.primary,
  fontSize: '1.15rem',
  lineHeight: 1.5,
  cursor: 'pointer',
}));

const ActionsRow = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  color: theme.palette.text.secondary,
}));

const CommentsSection = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const HomePage = () => {
  const { user, accessToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostText, setNewPostText] = useState('');
  const [commentsByPostId, setCommentsByPostId] = useState({});
  const [showCommentsFor, setShowCommentsFor] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [showCommentInputFor, setShowCommentInputFor] = useState({});

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
      // Обновляем список постов после добавления
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
      const response = await api.post(
        `/posts/${postId}/like/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const updatedPost = response.data;

      setPosts((prevPosts) =>
        prevPosts.map((post) => (post.id === postId ? updatedPost : post))
      );
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
      const response = await api.post(
        `/posts/${postId}/repost/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const updatedPost = response.data;

      setPosts((prevPosts) =>
        prevPosts.map((post) => (post.id === postId ? updatedPost : post))
      );
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

  const goToUserPage = (username) => {
    navigate(`/user/${username}`);
  };

  const goToPostPage = (postId) => {
    navigate(`/post/${postId}`);
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Загрузка...</Typography>
      </Container>
    );
  }

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
          <PostPaper key={post.id} elevation={3}>
            <AuthorInfo>
              <Avatar
                src={post.author?.profile?.avatar || ''}
                alt={post.author_username}
                sx={{ width: 36, height: 36, cursor: 'pointer' }}
                onClick={() => goToUserPage(post.author_username)}
              />
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => goToUserPage(post.author_username)}
                >
                  {post.author_username}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {post.created_at
                    ? formatDistanceToNow(new Date(post.created_at), {
                        addSuffix: true,
                        locale: ru,
                      })
                    : ''}
                </Typography>
              </Box>
            </AuthorInfo>

            <PostContent variant="body1" onClick={() => goToPostPage(post.id)}>
              {post.content}
            </PostContent>

            <ActionsRow>
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
            </ActionsRow>

            {post.comment_count > 0 && (
              <CommentsSection>
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
                  <CommentsList
                    comments={commentsByPostId[post.id] || []}
                    postId={post.id}
                    onReplyAdded={() => fetchComments(post.id)}
                  />
                )}
              </CommentsSection>
            )}
          </PostPaper>
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
            <PostPaper key={post.id} elevation={2} sx={{ p: 2 }}>
              <Box
                sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                onClick={() => goToPostPage(post.id)}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{ mb: 0.5, cursor: 'default' }}
                >
                  <Link
                    component="button"
                    variant="subtitle2"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToUserPage(post.author_username);
                    }}
                    sx={{ cursor: 'pointer', color: 'inherit', textDecoration: 'underline' }}
                  >
                    {post.author_username}
                  </Link>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {post.created_at
                    ? formatDistanceToNow(new Date(post.created_at), {
                        addSuffix: true,
                        locale: ru,
                      })
                    : ''}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {post.content.length > 120
                    ? post.content.slice(0, 120) + '...'
                    : post.content}
                </Typography>
              </Box>
              <ActionsRow sx={{ mt: 1 }}>
                <Tooltip title="Лайк">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(post.id);
                    }}
                    color={post.liked_by_user ? 'primary' : 'default'}
                  >
                    <ThumbUpIcon />
                  </IconButton>
                </Tooltip>
                <Typography variant="caption">{post.like_count}</Typography>

                <Tooltip title="Репост">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRepost(post.id);
                    }}
                  >
                    <RepeatIcon />
                  </IconButton>
                </Tooltip>
                <Typography variant="caption">{post.repost_count || 0}</Typography>

                <Tooltip title="Комментарии">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleComments(post.id);
                    }}
                  >
                    <CommentIcon />
                  </IconButton>
                </Tooltip>
                <Typography variant="caption">{post.comment_count || 0}</Typography>
              </ActionsRow>
              {showCommentsFor[post.id] && !loadingComments[post.id] && (
                <CommentsSection sx={{ mt: 1 }}>
                  <CommentsList
                    comments={commentsByPostId[post.id] || []}
                    postId={post.id}
                    onReplyAdded={() => fetchComments(post.id)}
                  />
                </CommentsSection>
              )}
            </PostPaper>
          ))
        )}
      </Box>
    </Container>
  );
};

export default HomePage;
