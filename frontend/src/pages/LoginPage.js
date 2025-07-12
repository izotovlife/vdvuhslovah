// frontend/src/pages/LoginPage.js

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

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

  return (
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
  );
};

export default LoginPage;
