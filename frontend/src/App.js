// frontend/src/App.js

/*
  Главный файл приложения React, отвечающий за маршрутизацию и обёртку контекста авторизации.

  В этом файле:
  - Настроен React Router с приватными и публичными маршрутами.
  - Используется компонент PrivateRoute для защиты страниц, требующих авторизации.
  - Определены маршруты для страниц: входа, регистрации, профиля, постов, изменения пароля и других.
  - Заголовок (Header) отображается на всех страницах, кроме страницы авторизации.
  - Вся структура приложения обёрнута в AuthProvider, который управляет состоянием авторизации пользователя.

  Таким образом, этот файл связывает все основные страницы и компоненты, обеспечивая навигацию и защиту приватных маршрутов.
*/

import React, { useContext } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useParams,
  useLocation
} from 'react-router-dom';

import HomePage from './pages/HomePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import Header from './components/Header';
import ProfileEdit from './components/ProfileEdit';
import UserPage from './pages/UserPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import PostPage from './pages/PostPage';

import AuthPage from './components/AuthPage';

// Импортируем TimeAgoExample
import TimeAgoExample from './components/TimeAgoExample';

import { AuthProvider, AuthContext } from './context/AuthContext';

function PrivateRoute({ children }) {
  const { isLoggedIn, loading } = useContext(AuthContext);
  if (loading) return <div>Загрузка...</div>;
  return isLoggedIn ? children : <Navigate to="/auth" />;
}

function UserPageWrapper() {
  const { username } = useParams();
  return <UserPage username={username} />;
}

function AppRoutes() {
  const { loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <div>Загрузка...</div>;

  const showHeader = location.pathname !== '/auth';

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<AuthPage />} />

        <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
        <Route path="/profile/edit" element={<PrivateRoute><ProfileEdit /></PrivateRoute>} />
        <Route path="/change-password" element={<PrivateRoute><ChangePasswordPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

        <Route path="/user/:username" element={<PrivateRoute><UserPageWrapper /></PrivateRoute>} />
        <Route path="/post/:postId" element={<PrivateRoute><PostPage /></PrivateRoute>} />

        {/* Новый маршрут для TimeAgoExample */}
        <Route path="/timeago" element={<TimeAgoExample />} />

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
