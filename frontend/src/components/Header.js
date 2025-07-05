//frontend/src/components/Header.js

import React, { useContext } from 'react';
import { AppBar, Toolbar, IconButton, Avatar, Button, Typography } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Header() {
  const { isLoggedIn, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const hiddenPaths = ['/', '/login', '/register', '/welcome'];
  if (!isLoggedIn || hiddenPaths.includes(location.pathname)) return null;

  const avatarUrl = user?.profile?.avatar ? `http://localhost:8000${user.profile.avatar}` : undefined;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/home"
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
        >
          вДвухСловах
        </Typography>

        <IconButton component={Link} to="/profile" sx={{ p: 0 }}>
          <Avatar
            src={avatarUrl}
            alt={user?.username || 'Профиль'}
            sx={{ width: 40, height: 40, objectFit: 'cover' }}
          />
        </IconButton>

        <Button color="inherit" onClick={handleLogout} sx={{ ml: 2 }}>
          Выйти
        </Button>
      </Toolbar>
    </AppBar>
  );
}
