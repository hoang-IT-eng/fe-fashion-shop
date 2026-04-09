import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AuthPage from './pages/auth/AuthPage';
import AdminPage from './pages/AdminPage'; // Import trang Admin mới tạo

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/admin" element={<AdminPage />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;