// frontend/src/pages/UserPage.js

import React, { useEffect, useState, useContext } from 'react';
import {
  Container,
  Box,
  Typography,
  Avatar,
  Paper,
  Tab,
  Tabs,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import RepeatIcon from '@mui/icons-material/Repeat';
import CommentIcon from '@mui/icons-material/Comment';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useParams } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const UserInfoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const InfoText = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
}));

const PostPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
}));

const ActionsRow = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(1),
}));

export default function UserPage() {
  const { username } = useParams();
  const { user, accessToken } = useContext(AuthContext);

  // Проверяем, смотрит ли пользователь свой профиль
  const isOwner = user && user.username === username;

  // Добавляем токен в заголовки API
  useEffect(() => {
    if (accessToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [accessToken]);

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [reposts, setReposts] = useState([]);
  const [comments, setComments] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${username}/profile/`);
        setProfile(res.data);
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
      }
    };

    const fetchUserPosts = async () => {
      try {
        const res = await api.get(`/users/${username}/posts/`);
        setPosts(res.data);
      } catch (error) {
        console.error('Ошибка загрузки постов пользователя:', error);
      }
    };

    const fetchLikedPosts = async () => {
      try {
        const res = await api.get(`/users/${username}/liked-posts/`);
        setLikedPosts(res.data);
      } catch (error) {
        console.error('Ошибка загрузки понравившихся постов:', error);
      }
    };

    const fetchReposts = async () => {
      try {
        const res = await api.get(`/users/${username}/reposts/`);
        setReposts(res.data);
      } catch (error) {
        console.error('Ошибка загрузки репостов:', error);
      }
    };

    const fetchComments = async () => {
      try {
        const res = await api.get(`/users/${username}/comments/`);
        setComments(res.data);
      } catch (error) {
        console.error('Ошибка загрузки комментариев:', error);
      }
    };

    fetchProfile();
    fetchUserPosts();
    fetchLikedPosts();
    fetchReposts();
    fetchComments();
  }, [username]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  if (!profile) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Загрузка профиля...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <UserInfoBox>
        <Avatar
          src={profile.avatar || ''}
          alt={username}
          sx={{ width: 80, height: 80 }}
        />
        <InfoText>
          <Typography variant="h5" fontWeight="bold">
            {profile.full_name || username}
          </Typography>
          {isOwner && (
            <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
              Это ваш профиль
            </Typography>
          )}
          {profile.is_phone_public && profile.phone && (
            <Typography variant="body2">Телефон: {profile.phone}</Typography>
          )}
          {profile.is_email_public && profile.email && (
            <Typography variant="body2">Email: {profile.email}</Typography>
          )}
        </InfoText>
      </UserInfoBox>

      <Tabs value={tabIndex} onChange={handleTabChange} aria-label="User tabs">
        <Tab label="Публикации" />
        <Tab label="Понравившиеся" />
        <Tab label="Репосты" />
        <Tab label="Комментарии" />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {tabIndex === 0 &&
          (posts.length === 0 ? (
            <Typography>Публикаций нет.</Typography>
          ) : (
            posts.map((post) => (
              <PostPaper key={post.id}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {post.content}
                </Typography>
                <ActionsRow>
                  <Tooltip title="Лайки">
                    <IconButton size="small" disabled>
                      <ThumbUpIcon />
                    </IconButton>
                  </Tooltip>
                  <Typography variant="caption">{post.like_count}</Typography>

                  <Tooltip title="Репосты">
                    <IconButton size="small" disabled>
                      <RepeatIcon />
                    </IconButton>
                  </Tooltip>
                  <Typography variant="caption">{post.repost_count || 0}</Typography>

                  <Tooltip title="Комментарии">
                    <IconButton size="small" disabled>
                      <CommentIcon />
                    </IconButton>
                  </Tooltip>
                  <Typography variant="caption">{post.comment_count || 0}</Typography>

                  <Typography variant="caption" sx={{ marginLeft: 'auto' }}>
                    {post.created_at
                      ? formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                          locale: ru,
                        })
                      : ''}
                  </Typography>
                </ActionsRow>
              </PostPaper>
            ))
          ))}

        {tabIndex === 1 &&
          (likedPosts.length === 0 ? (
            <Typography>Нет понравившихся публикаций.</Typography>
          ) : (
            likedPosts.map((post) => (
              <PostPaper key={post.id}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {post.content}
                </Typography>
                <ActionsRow>
                  <Tooltip title="Лайки">
                    <IconButton size="small" disabled>
                      <ThumbUpIcon />
                    </IconButton>
                  </Tooltip>
                  <Typography variant="caption">{post.like_count}</Typography>

                  <Tooltip title="Репосты">
                    <IconButton size="small" disabled>
                      <RepeatIcon />
                    </IconButton>
                  </Tooltip>
                  <Typography variant="caption">{post.repost_count || 0}</Typography>

                  <Tooltip title="Комментарии">
                    <IconButton size="small" disabled>
                      <CommentIcon />
                    </IconButton>
                  </Tooltip>
                  <Typography variant="caption">{post.comment_count || 0}</Typography>

                  <Typography variant="caption" sx={{ marginLeft: 'auto' }}>
                    {post.created_at
                      ? formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                          locale: ru,
                        })
                      : ''}
                  </Typography>
                </ActionsRow>
              </PostPaper>
            ))
          ))}

        {tabIndex === 2 &&
          (reposts.length === 0 ? (
            <Typography>Нет репостов.</Typography>
          ) : (
            reposts.map((post) => (
              <PostPaper key={post.id}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {post.content}
                </Typography>
                <ActionsRow>
                  <Tooltip title="Лайки">
                    <IconButton size="small" disabled>
                      <ThumbUpIcon />
                    </IconButton>
                  </Tooltip>
                  <Typography variant="caption">{post.like_count}</Typography>

                  <Tooltip title="Репосты">
                    <IconButton size="small" disabled>
                      <RepeatIcon />
                    </IconButton>
                  </Tooltip>
                  <Typography variant="caption">{post.repost_count || 0}</Typography>

                  <Tooltip title="Комментарии">
                    <IconButton size="small" disabled>
                      <CommentIcon />
                    </IconButton>
                  </Tooltip>
                  <Typography variant="caption">{post.comment_count || 0}</Typography>

                  <Typography variant="caption" sx={{ marginLeft: 'auto' }}>
                    {post.created_at
                      ? formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                          locale: ru,
                        })
                      : ''}
                  </Typography>
                </ActionsRow>
              </PostPaper>
            ))
          ))}

        {tabIndex === 3 &&
          (comments.length === 0 ? (
            <Typography>Нет комментариев.</Typography>
          ) : (
            comments.map((comment) => (
              <PostPaper key={comment.id}>
                <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
                  К публикации: {comment.post_content?.slice(0, 50) || '—'}
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {comment.content}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ marginLeft: 'auto', display: 'block', mt: 1 }}
                >
                  {comment.created_at
                    ? formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                        locale: ru,
                      })
                    : ''}
                </Typography>
              </PostPaper>
            ))
          ))}
      </Box>
    </Container>
  );
}
