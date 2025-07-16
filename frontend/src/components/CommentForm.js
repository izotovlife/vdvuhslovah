// frontend/src/components/CommentForm.js

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Box, TextField, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

export default function CommentForm({ postId, parentId = null, onCommentCreated }) {
  const { axiosInstance } = useContext(AuthContext);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const payload = { content: content.trim() };
      if (parentId) payload.parent = parentId;

      const res = await axiosInstance.post(`/posts/${postId}/comments/`, payload);
      onCommentCreated(res.data);
      setContent('');
    } catch (error) {
      console.error('Ошибка при добавлении комментария:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}
    >
      <TextField
        variant="outlined"
        size="small"
        placeholder={parentId ? 'Ответить...' : 'Добавить комментарий...'}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading}
        fullWidth
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="small"
        endIcon={<SendIcon />}
        disabled={loading}
        sx={{ textTransform: 'none' }}
      >
        {loading ? '...' : 'Отправить'}
      </Button>
    </Box>
  );
}
