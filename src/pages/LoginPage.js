// pages/LoginPage.js
import AuthForm from '../components/Login/AuthForm';

function LoginPage() {
  return (
    <div>
      <h1>로그인 페이지</h1>
      <AuthForm type="login" />
    </div>
  );
}

export default LoginPage;
