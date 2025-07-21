// frontend/src/components/PostForm.js

import React, { useState } from 'react';
import api from '../api';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
} from '@mui/material';

export default function PostForm({ onPostCreated }) {
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      const res = await api.post('/posts/', { content });
      onPostCreated(res.data);
      setContent('');
    } catch (error) {
      console.error('Ошибка при создании поста:', error);
    }
  };

  return (
    <Paper elevation={4} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        Поделитесь своими мыслями
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Что нового?"
          placeholder="Напишите что-нибудь..."
          multiline
          minRows={3}
          fullWidth
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 2, borderRadius: 2 }}
        >
          Опубликовать
        </Button>
      </Box>
    </Paper>
  );
}
