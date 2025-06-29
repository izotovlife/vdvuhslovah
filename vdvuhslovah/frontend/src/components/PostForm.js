// src/components/PostForm.js

import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import axios from 'axios';

export default function PostForm({ onPostCreated, parentId, onCancel }) {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!parentId) setContent(''); // если это не ретвит — очищаем поле
  }, [parentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const token = localStorage.getItem('token');

      // ИСПРАВЛЕНИЕ: Добавляем /api/ в URL
      const url = `${process.env.REACT_APP_API}/api/posts/`;

      await axios.post(
        url, // Используем исправленный URL
        { content, parent: parentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setContent('');
      if (onPostCreated) onPostCreated();
      if (onCancel) onCancel();  // закрываем форму ретвита после отправки
    } catch (err) {
      console.error('Ошибка при создании поста:', err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
      {parentId && (
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Ретвит с комментарием
          <Button onClick={onCancel} size="small" sx={{ ml: 2 }}>
            Отмена
          </Button>
        </Typography>
      )}
      <TextField
        fullWidth
        label={parentId ? "Добавьте комментарий к ретвиту" : "Что нового?"}
        variant="outlined"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        inputProps={{ maxLength: 200 }}
        multiline
        maxRows={4}
        required
      />
      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        Опубликовать
      </Button>
    </Box>
  );
}

