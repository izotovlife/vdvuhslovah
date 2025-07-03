// frontend/src/App.js

import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from 'react-router-dom';
// import LoginPage from './pages/LoginPage'; // удалено — не используется
// import RegisterPage from './pages/RegisterPage'; // удалено — не используется
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import WelcomePage from './pages/WelcomePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import Header from './components/Header';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProfileEdit from './components/ProfileEdit';

// Импортируем UserPage
import UserPage from './components/UserPage';

function PrivateRoute({ children }) {
  const { isLoggedIn } = useContext(AuthContext);
  return isLoggedIn ? children : <Navigate to="/" />;
}

// Обёртка для передачи параметра username из URL в UserPage
function UserPageWrapper() {
  const { username } = useParams();
  return <UserPage username={username} />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/profile/edit" element={<PrivateRoute><ProfileEdit /></PrivateRoute>} />
          <Route path="/change-password" element={<PrivateRoute><ChangePasswordPage /></PrivateRoute>} />

          {/* Новый маршрут для страницы пользователя */}
          <Route path="/user/:username" element={<UserPageWrapper />} />

          <Route path="/login" element={<Navigate to="/" />} />
          <Route path="/register" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
