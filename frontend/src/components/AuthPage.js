// src/components/AuthPage.js

import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterPage from '../pages/RegisterPage'; // Импортируем именно RegisterPage

export default function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: `url('/assets/moscow.jpg')`, // путь из public
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
          <RegisterPage onSwitchToLogin={() => setShowLogin(true)} />  // Используем RegisterPage
        )}
      </div>
    </div>
  );
}
