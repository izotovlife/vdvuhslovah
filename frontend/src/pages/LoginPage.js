// frontend/src/pages/LoginPage.js

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { sendPasswordResetEmail } from '../Api';

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  // Для восстановления пароля
  const [forgotOpen, setForgotOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [snackMessage, setSnackMessage] = useState('');
  const [snackOpen, setSnackOpen] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(username, password);
      navigate('/home');
    } catch {
      setError('Ошибка входа: проверьте имя пользователя и пароль');
    }
  };

  const handleForgotPassword = async () => {
    setLoadingReset(true);
    try {
      await sendPasswordResetEmail(email);
      setSnackMessage('Письмо для восстановления отправлено');
      setSnackOpen(true);
      setForgotOpen(false);
      setEmail('');
    } catch {
      setSnackMessage('Ошибка при отправке письма');
      setSnackOpen(true);
    } finally {
      setLoadingReset(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div style={{ marginBottom: 12 }}>
          <label>Имя пользователя</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Пароль</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit" style={{ padding: '8px 16px' }}>Войти</button>
      </form>

      {/* Кнопка для восстановления пароля */}
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <button
          onClick={() => setForgotOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
            padding: 0,
            fontSize: '0.9rem',
            textDecoration: 'underline',
          }}
        >
          Забыли пароль?
        </button>
      </div>

      {/* Модальное окно для ввода email */}
      {forgotOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 4, width: 320 }}>
            <h3>Восстановление пароля</h3>
            <input
              type="email"
              placeholder="Введите email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: 8, marginBottom: 12 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setForgotOpen(false)}>Отмена</button>
              <button onClick={handleForgotPassword} disabled={!email || loadingReset}>
                {loadingReset ? 'Отправка...' : 'Отправить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Простое уведомление */}
      {snackOpen && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#333',
          color: 'white',
          padding: '8px 16px',
          borderRadius: 4,
        }}
          onClick={() => setSnackOpen(false)}
        >
          {snackMessage}
        </div>
      )}
    </>
  );
};

export default LoginPage;
