// frontend/src/pages/RegisterPageWithBackground.js

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import RegisterPage from './RegisterPage'; // Убедитесь, что этот компонент существует

const RegisterPageWithBackground = () => {
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
      {/* Левая часть: форма регистрации */}
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
        <RegisterPage />
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
          Зарегистрируйтесь, чтобы начать использовать наш сервис.
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterPageWithBackground;
