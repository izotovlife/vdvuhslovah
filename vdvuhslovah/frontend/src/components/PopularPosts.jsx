// src/components/PopularPosts.jsx

import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const PopularPosts = ({ posts }) => {
  // Сортируем посты по количеству лайков (по убыванию)
  const popularPosts = [...posts]
    .sort((a, b) => b.like_count - a.like_count)
    .slice(0, 3); // Берем топ-3

  if (popularPosts.length === 0) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          🔥 Популярное
        </Typography>
        <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
          Пока нет популярных постов
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        🔥 Популярное
      </Typography>

      <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
        {popularPosts.map(post => (
          <Card
            key={post.id}
            sx={{ mb: 2 }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                  {post.author_username}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(post.created_at).toLocaleDateString()}
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ mb: 1 }}>
                {post.content}
              </Typography>

              {post.parent && (
                <Card variant="outlined" sx={{ bgcolor: '#f9f9f9', p: 1, mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Ретвит: <strong>{post.parent.author_username}</strong>
                  </Typography>
                  <Typography variant="body2" fontStyle="italic">
                    "{post.parent.content}"
                  </Typography>
                </Card>
              )}

              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.8rem',
                color: 'text.secondary',
                pt: 1,
                borderTop: '1px solid',
                borderColor: 'divider'
              }}>
                <Typography variant="caption" sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                  ❤️ {post.like_count}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default PopularPosts;