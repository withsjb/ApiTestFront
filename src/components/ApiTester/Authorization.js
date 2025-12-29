import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const AUTH_CONFIGS = {
  'No Auth': { fields: [] },
  'Inherit from Parent': { fields: [], note: '* 부모 폴더의 인증 설정을 사용합니다.' },
  'Basic Auth': {
    fields: [
      { id: 'username', label: 'Username', type: 'text', placeholder: 'Enter username' },
      { id: 'password', label: 'Password', type: 'password', placeholder: 'Enter password' }
    ]
  },
  'Bearer Token': {
    fields: [
      { id: 'token', label: 'Token', type: 'text', placeholder: 'Paste token here', width: '300px' }
    ]
  },
  'API Key': {
    fields: [
      { id: 'key', label: 'Key', type: 'text', placeholder: 'Key' },
      { id: 'value', label: 'Value', type: 'text', placeholder: 'Value' }
    ]
  },
  'OAuth 2.0': {
    isCard: true,
    fields: [
      { id: 'accessToken', label: 'Access Token', type: 'textarea', placeholder: 'Access Token', fullWidth: true },
      { id: 'grantType', label: 'Grant Type', type: 'select', options: ['client_credentials', 'password'] },
      { id: 'clientAuthMethod', label: 'Client Auth Method', type: 'select', options: ['header', 'body'], note: '보통 header를 사용하며, 서버 설정에 따라 body를 선택하세요.' },
      { id: 'accessTokenUrl', label: 'Access Token URL', type: 'text', placeholder: 'https://oauth.example.com/token' },
      { id: 'clientId', label: 'Client ID', type: 'text' },
      { id: 'clientSecret', label: 'Client Secret', type: 'password' },
      { id: 'scope', label: 'Scope', type: 'text', placeholder: 'e.g. read write' }
    ]
  }
};

const Authorization = ({ onAuthChange, initialAuth }) => {
  const [authType, setAuthType] = useState(initialAuth?.authType || 'No Auth');
  const [authData, setAuthData] = useState(initialAuth?.authData || {});
  const [showPassword, setShowPassword] = useState(false);

  // 부모로부터 내려오는 데이터(initialAuth)가 변경될 때 내부 상태 동기화
  useEffect(() => {
    if (initialAuth) {
      setAuthType(initialAuth.authType || 'No Auth');
      setAuthData(initialAuth.authData || {});
    }
  }, [initialAuth]);

  const handleAuthTypeChange = (e) => {
    const newType = e.target.value;
    const config = AUTH_CONFIGS[newType];
    const newData = {};
    
    if (config?.fields) {
      config.fields.forEach(f => {
        if (f.id === 'grantType') newData[f.id] = 'client_credentials';
        else if (f.id === 'clientAuthMethod') newData[f.id] = 'header';
        else newData[f.id] = '';
      });
    }

    setAuthType(newType);
    setAuthData(newData);
    onAuthChange({ authType: newType, authData: newData });
  };

  const handleInputChange = (field, value) => {
    const updatedAuthData = { ...authData, [field]: value };
    setAuthData(updatedAuthData);
    onAuthChange({ authType, authData: updatedAuthData });
  };

  const fetchOAuthToken = async () => {
    const { accessTokenUrl, clientId, clientSecret, grantType, clientAuthMethod, scope } = authData;
    
    if (!accessTokenUrl || !clientId || !clientSecret) {
      alert("Token URL, Client ID, Client Secret을 모두 입력해주세요.");
      return;
    }

    try {
      const response = await fetch('/api/proxy/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenUrl: accessTokenUrl,
          clientId,
          clientSecret,
          grantType: grantType || 'client_credentials',
          clientAuthMethod: clientAuthMethod || 'header',
          scope: scope || ''
        })
      });

      const data = await response.json();
      if (response.ok && data.access_token) {
        handleInputChange('accessToken', data.access_token);
        alert("토큰 발급 성공!");
      } else {
        alert("토큰 발급 실패: " + (data.error_description || data.error || "응답에 토큰이 없습니다."));
      }
    } catch (error) {
      alert("프록시 서버 연결 실패: " + error.message);
    }
  };

  const renderInputField = (field) => {
    if (field.type === 'textarea') {
      return (
        <textarea
          style={{ width: '100%', minHeight: '60px', padding: '8px', boxSizing: 'border-box' }}
          placeholder={field.placeholder}
          value={authData[field.id] || ''}
          onChange={(e) => handleInputChange(field.id, e.target.value)}
        />
      );
    }

    if (field.type === 'select') {
      return (
        <select 
          style={{ width: '100%', padding: '5px' }}
          value={authData[field.id] || ''}
          onChange={(e) => handleInputChange(field.id, e.target.value)}
        >
          {field.options.map(opt => (
             <option key={opt} value={opt}>
               {field.id === 'clientAuthMethod' && opt === 'header' ? 'Basic Auth Header (추천)' : opt}
             </option>
          ))}
        </select>
      );
    }

    return (
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type={field.type === 'password' && !showPassword ? 'password' : 'text'}
          placeholder={field.placeholder || field.label}
          style={{ width: field.width || '100%', paddingRight: field.type === 'password' ? '35px' : '10px' }}
          value={authData[field.id] || ''}
          onChange={(e) => handleInputChange(field.id, e.target.value)}
        />
        {field.type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{ position: 'absolute', right: '5px', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
        )}
      </div>
    );
  };

  const currentConfig = AUTH_CONFIGS[authType];

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <label style={{ fontWeight: 'bold' }}>Auth Type:</label>
        <select value={authType} onChange={handleAuthTypeChange} style={{ padding: '5px' }}>
          {Object.keys(AUTH_CONFIGS).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {currentConfig?.note && <span style={{ fontSize: '0.85em', color: '#666', fontStyle: 'italic' }}>{currentConfig.note}</span>}
      </div>

      {currentConfig?.fields.length > 0 && (
        <div style={currentConfig.isCard ? {
          border: '1px solid #ddd', padding: '15px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '10px'
        } : {
          display: 'flex', gap: '10px', flexWrap: 'wrap'
        }}>
          {currentConfig.fields.map(field => (
            <div key={field.id} style={{ width: field.fullWidth ? '100%' : 'auto', minWidth: '180px' }}>
              <label style={{ display: 'block', fontSize: '0.75em', color: '#555', marginBottom: '3px' }}>
                {field.label} {field.note && <span style={{color: '#999'}}>({field.note})</span>}
              </label>
              {renderInputField(field)}
            </div>
          ))}
          
          {authType === 'OAuth 2.0' && (
            <button 
              type="button" 
              onClick={fetchOAuthToken}
              style={{ alignSelf: 'flex-start', marginTop: '5px', padding: '6px 12px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Get New Access Token
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Authorization;