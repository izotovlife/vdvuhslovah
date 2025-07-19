// CommentForm.js
// Форма для добавления нового комментария или ответа на существующий комментарий к посту.
// Принимает ID поста и необязательный parentId (если это ответ).
// Отправляет данные на сервер через axios из контекста авторизации.
// После успешной отправки вызывает onCommentCreated с данными нового комментария.

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

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
      if (parentId) {
        payload.parent = parentId;  // Добавляем parent, если это ответ на комментарий
      }
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
    <form onSubmit={handleSubmit} style={{ marginTop: 8, display: 'flex', alignItems: 'center' }}>
      <input
        type="text"
        placeholder={parentId ? "Ответить на комментарий..." : "Добавить комментарий..."}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading}
        style={{ flexGrow: 1, padding: '6px 8px', fontSize: 14 }}
      />
      <button
        type="submit"
        disabled={loading}
        style={{
          marginLeft: 8,
          padding: '6px 12px',
          fontSize: 12,
          cursor: 'pointer',
          minWidth: 70,
          whiteSpace: 'nowrap',
        }}
      >
        {loading ? 'Отправляю...' : 'Отправить ➤'}
      </button>
    </form>
  );
}
