// frontend/src/App.js

import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from 'react-router-dom';

import HomePage from './pages/HomePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import Header from './components/Header';
import ProfileEdit from './components/ProfileEdit';
import UserPage from './pages/UserPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';

import RegisterPageWithBackground from './pages/RegisterPageWithBackground';
import LoginPageWithBackground from './pages/LoginPageWithBackground';

import { AuthProvider, AuthContext } from './context/AuthContext';

function PrivateRoute({ children }) {
  const { isLoggedIn, loading } = useContext(AuthContext);
  if (loading) return <div>Загрузка...</div>;
  return isLoggedIn ? children : <Navigate to="/" />;
}

function UserPageWrapper() {
  const { username } = useParams();
  return <UserPage username={username} />;
}

function AppRoutes() {
  const { loading } = useContext(AuthContext);

  if (loading) return <div>Загрузка...</div>;

  return (
    <Router>
      <Header />
      <Routes>
        {/* Регистрация с фоном */}
        <Route path="/" element={<RegisterPageWithBackground />} />
        <Route path="/register" element={<RegisterPageWithBackground />} />

        {/* Приватные маршруты */}
        <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
        <Route path="/profile/edit" element={<PrivateRoute><ProfileEdit /></PrivateRoute>} />
        <Route path="/change-password" element={<PrivateRoute><ChangePasswordPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

        {/* Пользовательские страницы */}
        <Route path="/user/:username" element={<UserPageWrapper />} />

        {/* Восстановление пароля */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Логин с фоном */}
        <Route path="/login" element={<LoginPageWithBackground />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
