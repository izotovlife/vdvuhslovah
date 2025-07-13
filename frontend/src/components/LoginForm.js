// src/components/LoginForm.js

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginForm({ onSwitchToRegister }) {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(username, password);
      navigate('/home');
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Ошибка при входе'
      );
      console.error('Ошибка логина:', err);
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: 'auto',
        padding: 20,
        border: '1px solid #ccc',
        borderRadius: 8,
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      }}
    >
      <h2 style={{ textAlign: 'center' }}>Вход</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="text"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ padding: 10, fontSize: 16, borderRadius: 4, border: '1px solid #ddd' }}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: 10, fontSize: 16, borderRadius: 4, border: '1px solid #ddd' }}
        />
        <button
          type="submit"
          style={{
            padding: 12,
            fontSize: 16,
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Войти
        </button>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      </form>

      {/* Ссылка "Забыли пароль?" */}
      <p style={{ textAlign: 'right', marginTop: 8 }}>
        <button
          type="button"
          onClick={() => navigate('/forgot-password')}
          style={{
            background: 'none',
            border: 'none',
            color: '#1976d2',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0,
            fontSize: 14,
          }}
        >
          Забыли пароль?
        </button>
      </p>

      <p style={{ textAlign: 'center', marginTop: 16 }}>
        Нет аккаунта?{' '}
        <button
          onClick={onSwitchToRegister}
          style={{
            background: 'none',
            border: 'none',
            color: '#1976d2',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0,
          }}
          type="button"
        >
          Зарегистрироваться
        </button>
      </p>
    </div>
  );
}
