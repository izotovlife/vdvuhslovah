// frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import PostForm from './components/PostForm';
import PostList from './components/PostList';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm'; // компонент для входа
// import Login from './pages/Login'; // можно удалить или использовать вместо LoginForm

function Home() {
  const [refresh, setRefresh] = React.useState(false);

  return (
    <main style={{ maxWidth: 600, margin: '20px auto' }}>
      <PostForm onPostCreated={() => setRefresh(!refresh)} />
      <PostList key={refresh} />
    </main>
  );
}

export default function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} />
        {/* Добавляй новые пути сюда */}
      </Routes>
    </Router>
  );
}



