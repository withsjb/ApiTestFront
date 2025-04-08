import React, { useState } from 'react';

const Authorization = ({ onAuthChange }) => {
  const [authType, setAuthType] = useState('No Auth'); // 기본 인증 타입
  const [authData, setAuthData] = useState({
    username: '', // Basic Auth 사용자 이름
    password: '', // Basic Auth 비밀번호
    token: '',    // Bearer Token
    key: '',      // API Key의 Key 값
    value: '',    // API Key의 Value 값
  });

  const handleAuthTypeChange = (e) => {
    const newAuthType = e.target.value;
    setAuthType(newAuthType); // 선택된 인증 타입 업데이트

    // 인증 데이터 변경을 부모 컴포넌트에 전달
    onAuthChange({ authType: newAuthType, authData });
  };

  const handleInputChange = (field, value) => {
    const updatedAuthData = { ...authData, [field]: value };
    setAuthData(updatedAuthData);

    // 변경된 데이터를 부모 컴포넌트에 전달
    onAuthChange({ authType, authData: updatedAuthData });
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <label>Auth Type:</label>
        <select value={authType} onChange={handleAuthTypeChange}>
          <option value="No Auth">No Auth</option>
          <option value="Basic Auth">Basic Auth</option>
          <option value="Bearer Token">Bearer Token</option>
          <option value="API Key">API Key</option>
        </select>

        {/* Authorization 타입별 입력 필드 */}
        {authType === 'Basic Auth' && (
          <>
            <input
              type="text"
              placeholder="Username"
              value={authData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={authData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
            />
          </>
        )}

        {authType === 'Bearer Token' && (
          <input
            type="text"
            placeholder="Token"
            value={authData.token}
            onChange={(e) => handleInputChange('token', e.target.value)}
          />
        )}

        {authType === 'API Key' && (
          <>
            <input
              type="text"
              placeholder="Key"
              value={authData.key}
              onChange={(e) => handleInputChange('key', e.target.value)}
            />
            <input
              type="text"
              placeholder="Value"
              value={authData.value}
              onChange={(e) => handleInputChange('value', e.target.value)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Authorization;
