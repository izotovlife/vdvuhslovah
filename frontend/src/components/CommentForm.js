// frontend/src/components/CommentForm.js

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function CommentForm({ postId, onCommentCreated }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const { axiosInstance } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Комментарий не может быть пуст');
      return;
    }

    try {
      const response = await axiosInstance.post(`/posts/${postId}/comments/`, { content });
      setContent('');
      setError('');
      onCommentCreated(response.data);
    } catch (err) {
      console.error('Ошибка при добавлении комментария:', err);
      if (err.response?.status === 401) {
        setError('Вы не авторизованы. Пожалуйста, войдите.');
      } else {
        setError('Ошибка при отправке комментария.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Оставьте комментарий"
        rows={3}
      />
      <button type="submit">Отправить</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
