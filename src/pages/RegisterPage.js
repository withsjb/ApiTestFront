// pages/RegisterPage.js
import AuthForm from '../components/Login/AuthForm';

function RegisterPage() {
  return (
    <div>
      <h1>회원가입 페이지</h1>
      <AuthForm type="register" />
    </div>
  );
}

export default RegisterPage;
