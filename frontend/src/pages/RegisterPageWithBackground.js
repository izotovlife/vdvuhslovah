// frontend/src/pages/RegisterPageWithBackground.js

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import RegisterPage from './RegisterPage';

const RegisterPageWithBackground = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        height: '100vh',
        backgroundImage: 'url(/assets/moscow.jpg)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Левая часть: форма регистрации */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.85)', // Полупрозрачный белый
          p: 4,
          m: 2,
          borderRadius: 3,
          boxShadow: 5,
        }}
      >
        <RegisterPage />
      </Box>

      {/* Правая часть: приветствие, скрывается на маленьких экранах */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          p: 6,
          textAlign: 'center',
        }}
      >
        <Typography variant="h3" gutterBottom>
          Добро пожаловать!
        </Typography>
        <Typography variant="h6">
          Зарегистрируйтесь, чтобы начать использовать наш сервис.
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterPageWithBackground;
