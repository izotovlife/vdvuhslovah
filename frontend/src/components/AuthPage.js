// src/components/AuthPage.js
// Компонент авторизации и регистрации пользователя.
// Позволяет переключаться между формой входа (LoginForm) и страницей регистрации (RegisterPage).
// Обеспечивает красивый фон и центрирование форм по экрану.

import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterPage from '../pages/RegisterPage'; // Импорт страницы регистрации

export default function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: `url('/assets/moscow.jpg')`, // путь к изображению из папки public
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          maxWidth: 450,
          width: '100%',
          padding: 20,
          borderRadius: 8,
          boxShadow: '0 0 15px rgba(0,0,0,0.1)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        }}
      >
        {showLogin ? (
          <LoginForm onSwitchToRegister={() => setShowLogin(false)} />
        ) : (
          <RegisterPage onSwitchToLogin={() => setShowLogin(true)} />
        )}
      </div>
    </div>
  );
}
