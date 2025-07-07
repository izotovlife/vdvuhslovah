// frontend/src/pages/UserPage.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  Avatar,
  Grid,
  Paper,
  CircularProgress,
} from '@mui/material';

export default function UserPage({ username }) {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [reposts, setReposts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // Получаем профиль пользователя
    axios.get(`/api/users/${username}/profile/`)
      .then(res => setProfile(res.data))
      .catch(() => setProfile(null));

    // Получаем публикации пользователя
    axios.get(`/api/users/${username}/posts/`)
      .then(res => setPosts(res.data))
      .catch(() => setPosts([]));

    // Получаем репосты пользователя
    axios.get(`/api/users/${username}/reposts/`)
      .then(res => setReposts(res.data))
      .catch(() => setReposts([]));

    // Получаем лайкнутые посты пользователя
    axios.get(`/api/users/${username}/liked-posts/`)
      .then(res => setLikedPosts(res.data))
      .catch(() => setLikedPosts([]))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6">Пользователь не найден</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar
          src={profile.avatar}
          sx={{ width: 100, height: 100, mr: 2 }}
        />
        <Box>
          <Typography variant="h4">
            {profile.first_name} {profile.last_name} ({profile.user?.username || username})
          </Typography>
          <Typography variant="body1">{profile.email}</Typography>
          <Typography variant="body1">{profile.phone}</Typography>
          <Typography variant="body2" color="text.secondary">
            {profile.country}, {profile.city}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5">Публикации</Typography>
          {posts.length === 0 && <Typography>Публикаций нет</Typography>}
          {posts.map(post => (
            <Paper key={post.id} sx={{ p: 2, mb: 2 }}>
              <Typography>{post.content}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(post.created_at).toLocaleString()}
              </Typography>
            </Paper>
          ))}
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h5">Репосты</Typography>
          {reposts.length === 0 && <Typography>Репостов нет</Typography>}
          {reposts.map(repost => (
            <Paper key={repost.id} sx={{ p: 2, mb: 2 }}>
              <Typography>
                Репост от {repost.user?.username} - оригинал: {repost.original_post?.content?.slice(0, 50) || '...'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(repost.created_at).toLocaleString()}
              </Typography>
            </Paper>
          ))}
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h5">Понравившиеся публикации</Typography>
          {likedPosts.length === 0 && <Typography>Нет понравившихся публикаций</Typography>}
          {likedPosts.map(post => (
            <Paper key={post.id} sx={{ p: 2, mb: 2 }}>
              <Typography>{post.content}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(post.created_at).toLocaleString()}
              </Typography>
            </Paper>
          ))}
        </Grid>
      </Grid>
    </Container>
  );
}
