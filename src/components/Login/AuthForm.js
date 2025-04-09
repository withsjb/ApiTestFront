import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AuthForm({ type }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';
    const url = `${API}/api/auth/${type}`;
  
    try {
      const response = await axios.post(url, { id: username, passwd: password });
  
      if (type === 'login') {
        const { token, userId } = response.data; // ✅ 응답 데이터 구조 변경 반영
        localStorage.setItem('token', token); // JWT 토큰 저장
        localStorage.setItem('userId', userId); // 사용자 ID 저장
        alert('로그인 성공!');
        navigate('/'); // 메인 페이지로 이동
      } else {
        alert('회원가입 성공!');
        navigate('/login'); // 로그인 페이지로 이동
      }
    } catch (error) {
      console.error('에러 발생:', error);
      alert('에러 발생: ' + error.response?.data || '알 수 없는 오류');
    }
  };
  

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>{type === 'login' ? '로그인' : '회원가입'}</h2>
        <input 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="아이디" 
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="비밀번호" 
        />
        <button type="submit">{type === 'login' ? '로그인' : '회원가입'}</button>
      </form>
    </div>
  );
}

export default AuthForm;
