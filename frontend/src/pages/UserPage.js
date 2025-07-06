//vdvuhslovah\frontend\src\pages\UserPage.js

// frontend/src/pages/UserPage.js

import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { Tabs, Tab, Box, Typography, CircularProgress } from '@mui/material';
import PostCard from '../components/PostCard';
import { AuthContext } from '../context/AuthContext';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

export default function UserPage({ username }) {
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState(0);
  const [posts, setPosts] = useState([]);
  const [reposts, setReposts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    const fetchData = async () => {
      try {
        if (tab === 0) {
          const res = await api.get(`/users/${username}/posts/`);
          setPosts(res.data);
        } else if (tab === 1) {
          const res = await api.get(`/users/${username}/reposts/`);
          setReposts(res.data);
        } else if (tab === 2) {
          if (!user || user.username !== username) {
            setLikedPosts([]);
            return;
          }
          const res = await api.get('/posts/liked/');
          setLikedPosts(res.data);
        }
      } catch (err) {
        setError('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tab, username, user]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const isCurrentUser = user && user.username === username;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" mb={3}>Профиль: {username}</Typography>

      <Tabs value={tab} onChange={handleTabChange} aria-label="Профиль вкладки">
        <Tab label="Посты" id="tab-0" aria-controls="tabpanel-0" />
        <Tab label="Репосты" id="tab-1" aria-controls="tabpanel-1" />
        {isCurrentUser && <Tab label="Понравившиеся" id="tab-2" aria-controls="tabpanel-2" />}
      </Tabs>

      {loading && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

      <TabPanel value={tab} index={0}>
        {posts.length === 0 && !loading && <Typography>Нет постов</Typography>}
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </TabPanel>

      <TabPanel value={tab} index={1}>
        {reposts.length === 0 && !loading && <Typography>Нет репостов</Typography>}
        {reposts.map(repost => (
          <Box key={repost.id} mb={2}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Репост от {repost.user.username} — {new Date(repost.created_at).toLocaleString()}
            </Typography>
            <PostCard post={repost.original_post} />
          </Box>
        ))}
      </TabPanel>

      {isCurrentUser && (
        <TabPanel value={tab} index={2}>
          {likedPosts.length === 0 && !loading && <Typography>Нет понравившихся постов</Typography>}
          {likedPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </TabPanel>
      )}
    </Box>
  );
}
