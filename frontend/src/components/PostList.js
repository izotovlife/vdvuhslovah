import React, { useState } from 'react';
import api from '../api';

export default function ProfileEdit({ profile, onUpdated }) {
  const [bio, setBio] = useState(profile?.bio || '');
  const [phone, setPhone] = useState(profile?.phone || '');

  const handleSave = async () => {
    try {
      const res = await api.put('/profile/', { bio, phone });
      onUpdated(res.data);
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
    }
  };

  return (
    <div>
      <h2>Редактирование профиля</h2>
      <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} />
      <button onClick={handleSave}>Сохранить</button>
    </div>
  );
}
