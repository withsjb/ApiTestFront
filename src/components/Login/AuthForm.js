// components/AuthForm.js
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AuthForm({ type }) {
  const [id, setId] = useState('');
  const [passwd, setPasswd] = useState('');
  const navigate = useNavigate(); 

  // const handleGoToRegister = () => {
  //   navigate('/register'); // ⬅️ /register로 이동
  // };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const API = process.env.REACT_APP_API_BASE_URL;
    const url = `${API}/api/auth/${type}`;

    try {
      const res = await axios.post(url, { id, passwd });

      if (type === 'login') {
        localStorage.setItem('token', res.data.token);
        alert('로그인 성공!');
        navigate('/');
      } else {
        alert('회원가입 성공!');
        navigate('/login');
      }
    } catch (err) {
      alert('에러 발생: ' + err.response?.data?.message);
    }
  };

  return (
<div>
    <form onSubmit={handleSubmit}>
      <h2>{type === 'login' ? '로그인' : '회원가입'}</h2>
      <input value={id} onChange={e => setId(e.target.value)} placeholder="아이디" />
      <input type="password" value={passwd} onChange={e => setPasswd(e.target.value)} placeholder="비밀번호" />
      <button type="submit">{type === 'login' ? '로그인' : '회원가입'}</button>
      
    </form>
    
    </div>
  );
}

export default AuthForm;
