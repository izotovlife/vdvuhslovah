// frontend/src/components/UserPage.js

// frontend/src/components/UserPage.js

import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Box, Typography, Card, CardContent, Tabs, Tab } from '@mui/material';
import { AuthContext } from '../context/AuthContext';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

export default function UserPage({ username }) {
  const [tabIndex, setTabIndex] = useState(0);
  const [posts, setPosts] = useState([]);
  const [reposts, setReposts] = useState([]);
  const [comments, setComments] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);

  const { user, axiosInstance } = useContext(AuthContext);
  const isOwnProfile = user?.username === username;

  // Fetching data for each tab
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
        .catch((error) => {
          console.error('Error fetching liked posts:', error.response?.data || error.message);
          setLikedPosts([]);
        });
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

  return (
    <Box sx={{ width: '100%' }}>
      {/* Добавление заголовка, как в Twitter (Username с @) */}
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        {user?.name} <span style={{ color: '#1DA1F2' }}>@{username}</span>
      </Typography>

      <Tabs value={tabIndex} onChange={handleChange}>
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
                <Typography variant="caption">
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
                  Репост поста #{repost.original_post}
                </Typography>
                <Typography variant="caption">
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
                <Typography variant="caption">
                  Комментарий к посту #{comment.post}
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
                  <Typography variant="caption">
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
