// frontend/src/App.js

// frontend/src/App.js

import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from 'react-router-dom';

import HomePage from './pages/HomePage';
import WelcomePage from './pages/WelcomePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import Header from './components/Header';
import ProfileEdit from './components/ProfileEdit';
import UserPage from './pages/UserPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import { AuthProvider, AuthContext } from './context/AuthContext';

function PrivateRoute({ children }) {
  const { isLoggedIn } = useContext(AuthContext);
  return isLoggedIn ? children : <Navigate to="/" />;
}

function UserPageWrapper() {
  const { username } = useParams();
  return <UserPage username={username} />;
}

function ProfileRedirect() {
  const { user } = useContext(AuthContext);
  return user ? <Navigate to={`/user/${user.username}`} /> : <Navigate to="/" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          {/* Основные маршруты */}
          <Route path="/" element={<WelcomePage />} />
          <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/profile/edit" element={<PrivateRoute><ProfileEdit /></PrivateRoute>} />
          <Route path="/change-password" element={<PrivateRoute><ChangePasswordPage /></PrivateRoute>} />

          {/* 🔁 Редирект /profile → /user/:username */}
          <Route path="/profile" element={<PrivateRoute><ProfileRedirect /></PrivateRoute>} />

          {/* Страница пользователя */}
          <Route path="/user/:username" element={<UserPageWrapper />} />

          {/* Страницы восстановления пароля */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Редирект на главную с /login и /register */}
          <Route path="/login" element={<Navigate to="/" />} />
          <Route path="/register" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
