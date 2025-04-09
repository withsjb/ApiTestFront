// src/components/Header.js
import React from 'react';
import { jwtDecode } from 'jwt-decode'; // ✅ named export로 변경
import { useNavigate } from 'react-router-dom';
import './Header.css'; // CSS 파일 import

function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token'); // ✅ 로컬 스토리지에서 JWT 토큰 가져오기

  let userId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token); // ✅ JWT 디코딩하여 사용자 ID 추출
      userId = decoded.sub; // JWT의 `sub` 필드에서 사용자 ID 가져오기
    } catch (error) {
      console.error('토큰 디코딩 실패:', error); // 디코딩 실패 시 에러 로그 출력
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token'); // ✅ JWT 토큰 삭제
    localStorage.removeItem('userId'); // ✅ 사용자 ID 삭제 (선택 사항)
    navigate('/'); // 메인 페이지로 이동
  };

  return (
    <header className="header">
      <h1 className="logo" onClick={() => navigate('/')}>TeBell Api Test</h1>
      <div className="auth-section">
        {userId ? (
          <>
            <span className="user-text">{userId}님</span> {/* 로그인한 사용자 ID 표시 */}
            <button className="btn" onClick={handleLogout}>
              로그아웃
            </button>
          </>
        ) : (
          <button className="btn" onClick={() => navigate('/login')}>
            로그인
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
