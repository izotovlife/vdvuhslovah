// frontend/src/components/FollowButton.js
// Кнопка подписки/отписки с состоянием и API-запросами

import React, { useState } from 'react';
import { Button } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import axios from 'axios';

const FollowButton = ({ username, initialFollowStatus, token, onFollowChange }) => {
  const [followed, setFollowed] = useState(initialFollowStatus);
  const [loading, setLoading] = useState(false);

  const toggleFollow = async () => {
    if (!token) return alert('Пожалуйста, войдите в аккаунт');

    setLoading(true);
    try {
      if (followed) {
        await axios.delete(`/api/profile/${username}/unfollow/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollowed(false);
        onFollowChange && onFollowChange(false);
      } else {
        await axios.post(`/api/profile/${username}/follow/`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollowed(true);
        onFollowChange && onFollowChange(true);
      }
    } catch (e) {
      console.error(e);
      alert('Ошибка при изменении статуса подписки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={followed ? 'contained' : 'outlined'}
      color={followed ? 'primary' : 'inherit'}
      startIcon={followed ? <PersonRemoveIcon /> : <PersonAddIcon />}
      onClick={toggleFollow}
      disabled={loading}
      size="small"
    >
      {followed ? 'Отписаться' : 'Подписаться'}
    </Button>
  );
};

export default FollowButton;
