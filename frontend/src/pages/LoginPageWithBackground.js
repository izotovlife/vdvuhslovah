// frontend/src/pages/LoginPageWithBackground.js

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LoginPage from './LoginPage';

const LoginPageWithBackground = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        backgroundImage: 'url(/assets/moscow.jpg)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Левая часть: форма входа */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.paper',
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          margin: 4,
          maxWidth: 450,
          minWidth: 300,
        }}
      >
        <LoginPage />
      </Box>

      {/* Правая часть: темная полупрозрачная панель с текстом */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          p: 6,
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '1.5rem',
        }}
      >
        <Typography variant="h3" gutterBottom>
          Добро пожаловать!
        </Typography>
        <Typography>
          Войдите в аккаунт, чтобы использовать все возможности нашего сервиса.
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPageWithBackground;
