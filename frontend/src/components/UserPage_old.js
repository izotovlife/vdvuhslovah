// frontend/src/components/UserPage.js

import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Box, Typography, Card, CardContent, Tabs, Tab } from '@mui/material';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

export default function UserPage() {
  const { username } = useParams();
  const [tabIndex, setTabIndex] = useState(0);
  const [posts, setPosts] = useState([]);
  const [reposts, setReposts] = useState([]);
  const [comments, setComments] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loadingUserInfo, setLoadingUserInfo] = useState(true);

  const { user, axiosInstance } = useContext(AuthContext);
  const isOwnProfile = user?.username === username;

  // Загрузка профиля пользователя
  useEffect(() => {
    setLoadingUserInfo(true);
    axiosInstance.get(`/users/${username}/profile/`)
      .then(res => setUserInfo(res.data))
      .catch(() => setUserInfo(null))
      .finally(() => setLoadingUserInfo(false));
  }, [username, axiosInstance]);

  // Загрузка данных для вкладок
  const fetchPosts = useCallback(() => {
    axiosInstance.get(`/users/${username}/posts/`)
      .then(res => setPosts(res.data))
      .catch(() => setPosts([]));
  }, [username, axiosInstance]);

  const fetchReposts = useCallback(() => {
    axiosInstance.get(`/users/${username}/reposts/`)
      .then(res => setReposts(res.data))
      .catch(() => setReposts([]));
  }, [username, axiosInstance]);

  const fetchComments = useCallback(() => {
    axiosInstance.get(`/users/${username}/comments/`)
      .then(res => setComments(res.data))
      .catch(() => setComments([]));
  }, [username, axiosInstance]);

  const fetchLikedPosts = useCallback(() => {
    if (isOwnProfile) {
      axiosInstance.get('/posts/liked/')
        .then(res => setLikedPosts(res.data))
        .catch(() => setLikedPosts([]));
    }
  }, [isOwnProfile, axiosInstance]);

  useEffect(() => {
    if (!username) return;

    if (tabIndex === 0) fetchPosts();
    else if (tabIndex === 1) fetchReposts();
    else if (tabIndex === 2) fetchComments();
    else if (tabIndex === 3) fetchLikedPosts();
  }, [tabIndex, username, fetchPosts, fetchReposts, fetchComments, fetchLikedPosts]);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  if (loadingUserInfo) return <div>Загрузка профиля...</div>;
  if (!userInfo) return <div>Пользователь не найден</div>;

  return (
    <Box sx={{ width: '100%', maxWidth: 800, margin: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <img
          src={userInfo.profile?.avatar || '/default-avatar.png'}
          alt="avatar"
          style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', marginRight: 16 }}
          onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
        />
        <Box>
          <Typography variant="h4">{userInfo.username}</Typography>
          <Typography variant="body1">{userInfo.profile?.bio || 'Биография отсутствует'}</Typography>
        </Box>
      </Box>

      <Tabs value={tabIndex} onChange={handleChange} aria-label="user profile tabs">
        <Tab label="Посты" />
        <Tab label="Репосты" />
        <Tab label="Комментарии" />
        {isOwnProfile && <Tab label="Понравившиеся" />}
      </Tabs>

      <TabPanel value={tabIndex} index={0}>
        {posts.length === 0 ? (
          <Typography>Посты не найдены</Typography>
        ) : (
          posts.map(post => (
            <Card key={post.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="body1">{post.content}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Лайков: {post.like_count} | Комментариев: {post.comment_count} | Репостов: {post.repost_count}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </TabPanel>

      <TabPanel value={tabIndex} index={1}>
        {reposts.length === 0 ? (
          <Typography>Репосты не найдены</Typography>
        ) : (
          reposts.map(repost => (
            <Card key={repost.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="body2">
                  Репост поста #{repost.original_post?.id} — {repost.original_post?.content?.slice(0, 50) || ''}
                  {repost.original_post?.content && repost.original_post.content.length > 50 ? '...' : ''}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Сделан {new Date(repost.created_at).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </TabPanel>

      <TabPanel value={tabIndex} index={2}>
        {comments.length === 0 ? (
          <Typography>Комментарии не найдены</Typography>
        ) : (
          comments.map(comment => (
            <Card key={comment.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="body2">{comment.content}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Комментарий к посту #{comment.post_content ? comment.post_content : comment.post}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </TabPanel>

      {isOwnProfile && (
        <TabPanel value={tabIndex} index={3}>
          {likedPosts.length === 0 ? (
            <Typography>Нет понравившихся постов</Typography>
          ) : (
            likedPosts.map(post => (
              <Card key={post.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="body1">{post.content}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Лайков: {post.like_count} | Комментариев: {post.comment_count} | Репостов: {post.repost_count}
                  </Typography>
                </CardContent>
              </Card>
            ))
          )}
        </TabPanel>
      )}
    </Box>
  );
}
