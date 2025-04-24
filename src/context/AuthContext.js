import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(localStorage.getItem('userId'));
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);

  // 로그인 시 호출
  const login = (jwtToken, userId) => {
    setToken(jwtToken);
    setUser(userId);
    setIsLoggedIn(true);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('userId', userId);
  };

  // 로그아웃 시 호출
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  };

  // 앱 시작 시 토큰 복원
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('userId');
    if (storedToken) {
      setToken(storedToken);
      setUser(storedUser);
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);