// frontend/src/pages/ChangePasswordPage.js

import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ChangePasswordPage = () => {
  const { accessToken } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.new_password !== formData.confirm_password) {
      setError('Новые пароли не совпадают');
      return;
    }

    try {
      await axios.post('http://localhost:8000/api/change-password/', {
        old_password: formData.old_password,
        new_password: formData.new_password
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setSuccess(true);
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      setError('Ошибка при смене пароля');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Сменить пароль</h1>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">
          Текущий пароль:
          <input
            type="password"
            name="old_password"
            value={formData.old_password}
            onChange={handleChange}
            className="border p-1 w-full"
            required
          />
        </label>
        <label className="block mb-2">
          Новый пароль:
          <input
            type="password"
            name="new_password"
            value={formData.new_password}
            onChange={handleChange}
            className="border p-1 w-full"
            required
          />
        </label>
        <label className="block mb-2">
          Повторите новый пароль:
          <input
            type="password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
            className="border p-1 w-full"
            required
          />
        </label>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-2">Пароль успешно изменен</p>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >Сменить пароль</button>
      </form>
    </div>
  );
};

export default ChangePasswordPage;
