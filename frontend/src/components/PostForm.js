//C:\Users\ASUS Vivobook\PycharmProjects\PythonProject1\vdvuhslovah\frontend\src\components\PostForm.js

import React, { useState } from 'react';
import api from '../api';

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
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Напишите что-нибудь..."
      />
      <button type="submit">Опубликовать</button>
    </form>
  );
}
