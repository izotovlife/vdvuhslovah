// src/components/PostForm.js

import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';
import api from '../api';  // импорт единого экземпляра

export default function PostForm({ onPostCreated }) {
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await api.post('posts/', { content });  // только относительный путь
      setContent('');
      if (onPostCreated) onPostCreated();
    } catch (err) {
      console.error('Ошибка при создании поста:', err);
      alert('Ошибка при создании поста: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
      <TextField
        fullWidth
        label="Что нового?"
        variant="outlined"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        inputProps={{ maxLength: 200 }}
        multiline
        maxRows={4}
      />
      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        Опубликовать
      </Button>
    </Box>
  );
}


