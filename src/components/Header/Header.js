// src/components/Header.js
import React from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import './Header.css'; // CSS 분리한 파일 import

function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  let userId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.sub;
    } catch (error) {
      console.error('토큰 디코딩 실패:', error);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <header className="header">
      <h1 className="logo" onClick={() => navigate('/')}>TeBell Api Test</h1>
      <div className="auth-section">
        {userId ? (
          <>
            <span className="user-text">{userId}님</span>
            <button className="btn" onClick={handleLogout}>로그아웃</button>
          </>
        ) : (
          <button className="btn" onClick={() => navigate('/login')}>로그인</button>
        )}
      </div>
    </header>
  );
}

export default Header;
