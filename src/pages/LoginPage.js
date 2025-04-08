// pages/LoginPage.js
import AuthForm from '../components/Login/AuthForm';

import { useNavigate } from 'react-router-dom';
function LoginPage() {
    const navigate = useNavigate(); 
    const handleGoToRegister = () => {
        navigate('/register'); // ⬅️ /register로 이동
      };
      
  return (
    <div>
      <h1>로그인 페이지</h1>
      <AuthForm type="login" />
      <button onClick={handleGoToRegister}>회원가입 하러가기</button>
    </div>
  );
}

export default LoginPage;
