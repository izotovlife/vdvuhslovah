//C:\Users\ASUS Vivobook\PycharmProjects\PythonProject1\vdvuhslovah\frontend\src\components\UserPage.js

import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { Tabs, Tab, Box, Typography, Card, CardContent } from '@mui/material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

export default function UserPage({ username }) {
  const [tabIndex, setTabIndex] = useState(0);
  const [posts, setPosts] = useState([]);
  const [reposts, setReposts] = useState([]);
  const [comments, setComments] = useState([]);

  const fetchPosts = useCallback(() => {
    api.get(`/user/${username}/posts/`).then(res => setPosts(res.data));
  }, [username]);

  const fetchReposts = useCallback(() => {
    api.get(`/user/${username}/reposts/`).then(res => setReposts(res.data));
  }, [username]);

  const fetchComments = useCallback(() => {
    api.get(`/user/${username}/comments/`).then(res => setComments(res.data));
  }, [username]);

  useEffect(() => {
    if (!username) return;

    if (tabIndex === 0) fetchPosts();
    else if (tabIndex === 1) fetchReposts();
    else if (tabIndex === 2) fetchComments();
  }, [tabIndex, username, fetchPosts, fetchReposts, fetchComments]);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={tabIndex} onChange={handleChange}>
        <Tab label="Посты" />
        <Tab label="Репосты" />
        <Tab label="Комментарии" />
      </Tabs>

      <TabPanel value={tabIndex} index={0}>
        {posts.map(post => (
          <Card key={post.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="body1">{post.content}</Typography>
              <Typography variant="caption">
                Лайков: {post.like_count} | Комментариев: {post.comment_count} | Репостов: {post.repost_count}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </TabPanel>

      <TabPanel value={tabIndex} index={1}>
        {reposts.map(repost => (
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
        ))}
      </TabPanel>

      <TabPanel value={tabIndex} index={2}>
        {comments.map(comment => (
          <Card key={comment.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="body2">{comment.content}</Typography>
              <Typography variant="caption">
                Комментарий к посту #{comment.post}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </TabPanel>
    </Box>
  );
}
