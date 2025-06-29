// frontend/src/App.js

import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import PostForm from './components/PostForm';
import PostList from './components/PostList';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import PopularPosts from './components/PopularPosts';
import Profile from './components/Profile';
import api from './api';  // Импорт единого экземпляра api
import { Box, CircularProgress, Alert, Button } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const fetchPosts = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.get('posts/');  // Вызов через единый api
      setPosts(response.data);
    } catch (error) {
      console.error('Ошибка загрузки постов:', error);

      if (error.response?.status === 401) {
        setError('Сессия истекла. Пожалуйста, войдите снова.');
      } else {
        setError('Не удалось загрузить ленту постов. Пожалуйста, попробуйте позже.');
      }

      // Демонстрационные данные для разработки
      const mockData = [
        {
          id: 1,
          author_username: "demo_user",
          content: "Это демонстрационный пост",
          like_count: 10,
          created_at: new Date().toISOString(),
          parent: null
        },
        {
          id: 2,
          author_username: "another_user",
          content: "Это демонстрационный пост с ретвитом",
          like_count: 15,
          created_at: new Date().toISOString(),
          parent: {
            id: 99,
            author_username: "original_author",
            content: "Оригинальный контент для ретвита"
          }
        },
        {
          id: 3,
          author_username: "popular_user",
          content: "Популярный пост с большим количеством лайков",
          like_count: 42,
          created_at: new Date().toISOString(),
          parent: null
        }
      ];
      setPosts(mockData);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
    }
  }, [isAuthenticated, fetchPosts]);

  const handlePostCreated = useCallback(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (!isAuthenticated) {
    return (
      <Box sx={{ maxWidth: 600, margin: '40px auto', textAlign: 'center' }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Для просмотра ленты необходимо войти в систему
        </Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.href = '/login'}
        >
          Перейти на страницу входа
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{
      maxWidth: 1200,
      margin: '20px auto',
      display: 'flex',
      gap: '30px'
    }}>
      <Box sx={{ flex: 7 }}>
        <PostForm onPostCreated={handlePostCreated} />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : (
          <PostList posts={posts} onUpdatePosts={fetchPosts} />
        )}
      </Box>

      <Box sx={{ flex: 3, maxWidth: 350 }}>
        <PopularPosts posts={posts} />
      </Box>
    </Box>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  return (
    <Router>
      <Header isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterForm setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/login" element={<LoginForm setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

