
import React, { useState, useEffect } from 'react';

const Authorization = ({ onAuthChange, initialAuth }) => {
  // 초기 기본값 정의
  const initialAuthType = 'No Auth';
  const initialDataMap = {
    'Inherit from Parent': {},
    'No Auth': {},
    'Basic Auth': { username: '', password: '' },
    'Bearer Token': { token: '' },
    'API Key': { key: '', value: '' }
  };

  const [authType, setAuthType] = useState(initialAuthType);
  const [authData, setAuthData] = useState(initialDataMap[initialAuthType]);

  useEffect(() => {
    if (initialAuth) {
      setAuthType(initialAuth.authType);
      setAuthData(initialAuth.authData || {});
    }
  }, [initialAuth]);

  // 1. Auth Type 변경 핸들러
  const handleAuthTypeChange = (e) => {
    const newType = e.target.value;
    const newData = initialDataMap[newType]; // 해당 타입의 초기 데이터 가져오기

    // 상태 업데이트
    setAuthType(newType);
    setAuthData(newData);

    // ✅ useEffect를 기다리지 않고, 즉시 부모에게 알림 (무한 루프 방지)
    onAuthChange({ authType: newType, authData: newData });
  };

  // 2. 입력 필드 변경 핸들러
  const handleInputChange = (field, value) => {
    const updatedAuthData = { ...authData, [field]: value };

    // 상태 업데이트
    setAuthData(updatedAuthData);

    // ✅ 여기서도 즉시 부모에게 알림
    onAuthChange({ authType, authData: updatedAuthData });
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <label>Auth Type:</label>
        <select value={authType} onChange={handleAuthTypeChange}>
          <option value="Inherit from Parent">Inherit from Parent</option>
          <option value="No Auth">No Auth</option>
          <option value="Basic Auth">Basic Auth</option>
          <option value="Bearer Token">Bearer Token</option>
          <option value="API Key">API Key</option>
        </select>

        {authType === 'Inherit from Parent' && (
          <span style={{ fontSize: '0.85em', color: '#666', fontStyle: 'italic' }}>
            * 부모 폴더의 인증 설정을 사용합니다.
          </span>
        )}

        {/* Authorization 타입별 입력 필드 */}
        {authType === 'Basic Auth' && (
          <>
            <input
              type="text"
              placeholder="Username"
              value={authData.username || ''} // undefined 방지
              onChange={(e) => handleInputChange('username', e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={authData.password || ''}
              onChange={(e) => handleInputChange('password', e.target.value)}
            />
          </>
        )}

        {authType === 'Bearer Token' && (
          <input
            type="text"
            placeholder="Token"
            value={authData.token || ''}
            onChange={(e) => handleInputChange('token', e.target.value)}
          />
        )}

        {authType === 'API Key' && (
          <>
            <input
              type="text"
              placeholder="Key"
              value={authData.key || ''}
              onChange={(e) => handleInputChange('key', e.target.value)}
            />
            <input
              type="text"
              placeholder="Value"
              value={authData.value || ''}
              onChange={(e) => handleInputChange('value', e.target.value)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Authorization;