import React, { useState, useEffect } from 'react';

const Authorization = ({ onAuthChange }) => {
  const [authType, setAuthType] = useState('No Auth'); // 기본 인증 타입
  // 초기 상태를 인증 타입에 맞게 설정
  const [authData, setAuthData] = useState({});

  // ✅ 인증 타입 변경 시 데이터 초기화
  useEffect(() => {
    const initialData = {
      'No Auth': {},
      'Basic Auth': { username: '', password: '' },
      'Bearer Token': { token: '' },
      'API Key': { key: '', value: '' }
    };
    setAuthData(initialData[authType]);
    // useCallback으로 감싸진 함수를 사용하는 것이 좋습니다
  }, [authType]); // onAuthChange 제거
  
  // authData가 변경될 때만 부모에게 알림
  useEffect(() => {
    onAuthChange({ authType, authData });
  }, [authType, authData, onAuthChange]);

  const handleAuthTypeChange = (e) => {
    setAuthType(e.target.value); // useEffect가 처리하므로 데이터 초기화 코드 제거
  };

  const handleInputChange = (field, value) => {
    const updatedAuthData = { ...authData, [field]: value };
    setAuthData(updatedAuthData);
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
