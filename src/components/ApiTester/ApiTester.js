import React, { useState, useEffect, useCallback } from 'react';
import './ApiTester.css';
import Authorization from './Authorization';
import axios from '../../api/axiosInstance'; 

const ApiTester = ({ selectedHistory, onSendRequest, onSaveToHistory, onSelectHistory }) => {
  
  const [formData, setFormData] = useState({
    method: 'GET',
    url: '',
    authorization: { authType: 'No Auth', authData: {} },
    params: [{ key: '', value: '' }],
    headers: [{ key: '', value: '' }],
    body: '',
  });

  const reconstructAuthDetails = useCallback((history) => {
      const mapAuthTypeToUI = (dbAuthType) => {
        if (!dbAuthType) return 'No Auth';
        // ✅ 언더바(_)를 공백( )으로 반드시 바꿔서 UI 옵션값과 일치시켜야 합니다.
        if (dbAuthType === 'OAuth_2_0') return 'OAuth 2.0'; 
        return dbAuthType.replace(/_/g, ' ');
    };

      const authType = history.authType || 'No_Auth';
      const uiAuthType = mapAuthTypeToUI(authType);

      const authDetails = {
          authType: uiAuthType,
          authData: {},
      };

      switch (authType) {
          case 'Bearer_Token':
              authDetails.authData = { token: history.authorization };
              break;
          case 'OAuth_2_0': 
              authDetails.authData = { 
                  accessToken: history.authorization,
                  accessTokenUrl: history.authTokenUrl,
                  grantType: history.grantType,
                  scope: history.authScope,
                  clientId: history.clientId,
                  clientSecret: history.clientSecret,
                  clientAuthMethod: history.clientAuthMethod || 'header'
              };
              break;
          case 'Basic_Auth':
              authDetails.authData = { username: history.authUsername, password: history.authPassword };
              break;
          case 'API_Key':
              authDetails.authData = { key: history.apiKey, value: history.apiValue };
              break;
          case 'AWS_Signature':
            authDetails.authData = {
                awsAccessKey: history.awsAccessKey,
                awsSecretKey: history.awsSecretKey,
                awsRegion: history.awsRegion,
                awsService: history.awsService,
                awsSessionToken: history.awsSessionToken
            };
            break;
          default: 
              break;
      }
      return authDetails;
  }, []);

  const parseJSONField = (field) => {
    if (!field || (typeof field === 'string' && field.trim() === '')) return [{ key: '', value: '' }];
    let result;
    try {
        result = typeof field === 'string' ? JSON.parse(field) : field;
    } catch (e) {
        return [{ key: '', value: '' }];
    }
    return (!Array.isArray(result) || result.length === 0) ? [{ key: '', value: '' }] : result;
  };

  useEffect(() => {
    if (selectedHistory) {
      const authDetails = reconstructAuthDetails(selectedHistory);
      setFormData({
        method: selectedHistory.method,
        url: selectedHistory.apiUrl,
        authorization: authDetails,
        params: parseJSONField(selectedHistory.params),
        headers: parseJSONField(selectedHistory.headers),
        body: selectedHistory.body || '',
      });
    }
  }, [selectedHistory, reconstructAuthDetails]);

  const getFormattedData = () => {
    const { authType, authData } = formData.authorization;
    
    return {
      method: formData.method,
      url: formData.url,
      body: formData.body,
      authType: authType.replace(/[\s.]/g, '_'),
      
      token: authData.accessToken || authData.token || '',
      tokenUrl: authData.accessTokenUrl || '',
      grantType: authData.grantType || '',
      scope: authData.scope || '',
      clientId: authData.clientId || '',
      clientSecret: authData.clientSecret || '',
      clientAuthMethod: authData.clientAuthMethod || 'header',
      username: authData.username || '',
      password: authData.password || '',
      key: authData.key || '',
      value: authData.value || '',
      awsAccessKey: authData.awsAccessKey || '',
      awsSecretKey: authData.awsSecretKey || '',
      awsRegion: authData.awsRegion || '',
      awsService: authData.awsService || '',
      awsSessionToken: authData.awsSessionToken || '',
      
      params: formData.params.filter(p => p.key || p.value),
      headers: formData.headers.filter(h => h.key || h.value),
      parentId: selectedHistory?.apiId || null,
      collectionId: selectedHistory?.collectionId || null,
      apiId: selectedHistory?.apiId || null
    };
  };

  const handleReset = () => {
    setFormData({
      method: 'GET',
      url: '',
      authorization: { authType: 'No Auth', authData: {} },
      params: [{ key: '', value: '' }],
      headers: [{ key: '', value: '' }],
      body: '',
    });
    if (onSelectHistory) onSelectHistory(null);
  };

  const handleUpdateRecord = async () => {
    if (!selectedHistory?.apiId) {
        alert("수정할 기록이 선택되지 않았습니다.");
        return;
    }
    if (!window.confirm("현재 내용으로 기존 기록을 업데이트하시겠습니까?")) return;

    try {
        await axios.put(`/api/history/${selectedHistory.apiId}`, getFormattedData());
        alert("기록이 수정되었습니다.");
        if (onSaveToHistory) onSaveToHistory(); 
    } catch (error) {
        console.error("수정 오류:", error);
        alert("수정 실패");
    }
  };

  const handleSaveAsNew = () => {
    const data = getFormattedData();
    
    const newData = {
      ...data,
      apiId: null,         
      collectionId: null   // UNCLASSIFIED로 이동
    };

    if (onSaveToHistory) {
      onSaveToHistory(newData);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = getFormattedData();

    if (selectedHistory?.apiId) {
      try {
        await axios.put(`/api/history/${selectedHistory.apiId}`, dataToSend);
        if (onSaveToHistory) onSaveToHistory(); 
      } catch (err) {
        console.error("자동 업데이트 실패:", err);
      }
    }
    onSendRequest(dataToSend);
  };

  const handleAuthChange = (authDetails) => setFormData(prev => ({ ...prev, authorization: authDetails }));
  const handleAddParam = () => setFormData(prev => ({ ...prev, params: [...prev.params, { key: '', value: '' }] }));
  const handleAddHeader = () => setFormData(prev => ({ ...prev, headers: [...prev.headers, { key: '', value: '' }] }));

  return (
    <div className="api-tester-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignitEm: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>
          API Tester {selectedHistory && <span style={{fontSize: '0.7em', color: '#ff9800'}}>(기록 수정 중)</span>}
        </h3>
        <button 
          type="button" 
          onClick={handleReset} 
          style={{ padding: '5px 12px', cursor: 'pointer', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.8em' }}
        >
          + New Request
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <select value={formData.method} onChange={(e) => setFormData({ ...formData, method: e.target.value })}>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
          <input 
            className="url-input" 
            type="text" 
            placeholder="https://api.example.com" 
            value={formData.url} 
            onChange={(e) => setFormData({ ...formData, url: e.target.value })} 
          />
        </div>

        {/* ✅ 핵심: key 부여를 통해 selectedHistory가 바뀔 때마다 컴포넌트를 강제 리셋 */}
        <Authorization 
          key={selectedHistory?.apiId || 'new-request'} 
          onAuthChange={handleAuthChange} 
          initialAuth={formData.authorization} 
        />

        <div className="section">
          <label>Params:</label>
          {formData.params.map((p, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
              <input type="text" placeholder="Key" value={p.key} onChange={(e) => {
                const newList = [...formData.params]; newList[idx].key = e.target.value; setFormData({ ...formData, params: newList });
              }} />
              <input type="text" placeholder="Value" value={p.value} onChange={(e) => {
                const newList = [...formData.params]; newList[idx].value = e.target.value; setFormData({ ...formData, params: newList });
              }} />
              {idx === formData.params.length - 1 && <button type="button" onClick={handleAddParam}>+</button>}
            </div>
          ))}
        </div>

        <div className="section">
          <label>Headers:</label>
          {formData.headers.map((h, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
              <input type="text" placeholder="Key" value={h.key} onChange={(e) => {
                const newList = [...formData.headers]; newList[idx].key = e.target.value; setFormData({ ...formData, headers: newList });
              }} />
              <input type="text" placeholder="Value" value={h.value} onChange={(e) => {
                const newList = [...formData.headers]; newList[idx].value = e.target.value; setFormData({ ...formData, headers: newList });
              }} />
              {idx === formData.headers.length - 1 && <button type="button" onClick={handleAddHeader}>+</button>}
            </div>
          ))}
        </div>

        <div className="section">
          <label>Body (JSON):</label>
          <textarea value={formData.body} onChange={(e) => setFormData({ ...formData, body: e.target.value })} rows="5" />
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button type="submit" style={{backgroundColor: '#4CAF50', color: 'white'}}>Send Request</button>
          <button type="button" onClick={handleSaveAsNew}>새 기록으로 저장</button>
          {selectedHistory && (
            <button type="button" onClick={handleUpdateRecord} style={{backgroundColor: '#FF9800', color: 'white'}}>
              현재 기록 수정완료
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ApiTester;