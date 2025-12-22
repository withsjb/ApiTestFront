import React, { useState, useEffect, useCallback } from 'react';
import './ApiTester.css';
import Authorization from './Authorization';
import axios from '../../api/axiosInstance'; 

const ApiTester = ({ selectedHistory, onSendRequest, onSaveToHistory }) => {
  
  const [formData, setFormData] = useState({
    method: 'GET',
    url: '',
    authorization: { authType: 'No Auth', authData: {} },
    params: [{ key: '', value: '' }],
    headers: [{ key: '', value: '' }],
    body: '',
  });

  // 🔹 Authorization 객체 재구성
  const reconstructAuthDetails = useCallback((history) => {
      const mapAuthTypeToUI = (dbAuthType) => {
          if (!dbAuthType) return 'No Auth';
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
          case 'Basic_Auth':
              authDetails.authData = { username: history.authUsername, password: history.authPassword };
              break;
          case 'API_Key':
              authDetails.authData = { key: history.apiKey, value: history.apiValue };
              break;
          default: 
              break;
      }
      return authDetails;
  }, []);

  // 🔹 JSON 필드 파싱 (빈 배열 방지)
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

  // 🔹 선택된 기록 로드
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

  // 🔥 기록 수정 (PUT)
  const handleUpdateRecord = async () => {
    if (!selectedHistory?.apiId) {
        alert("수정할 기록이 선택되지 않았습니다.");
        return;
    }

    if (!window.confirm("현재 내용으로 기존 기록을 업데이트하시겠습니까?")) return;

    // 백엔드 RequestData DTO 구조와 일치시킴
    const dataToUpdate = {
        method: formData.method,
        url: formData.url,
        body: formData.body,
        authType: formData.authorization.authType.replace(/ /g, '_'),
        token: formData.authorization.authData?.token || '',
        // 상세 authData 필드들 매핑
        username: formData.authorization.authData?.username || '',
        password: formData.authorization.authData?.password || '',
        key: formData.authorization.authData?.key || '',
        value: formData.authorization.authData?.value || '',
        params: formData.params.filter(p => p.key || p.value),
        headers: formData.headers.filter(h => h.key || h.value),
    };

    try {
        // 백엔드 @PutMapping("/history/{requestId}") 경로와 일치해야 함
        await axios.put(`/api/history/${selectedHistory.apiId}`, dataToUpdate);
        alert("기록이 수정되었습니다.");
        if (onSaveToHistory) onSaveToHistory(); 
    } catch (error) {
        console.error("수정 중 오류 발생:", error);
        // 에러 메시지가 객체인 경우 문자열로 변환하여 출력
        const errorMsg = error.response?.data?.message || error.response?.data || error.message;
        alert("수정 실패: " + (typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg));
    }
  };

  const handleSaveAsNew = () => {
    onSaveToHistory(formData); 
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSendRequest(formData);
  };

  const handleAuthChange = (authDetails) => setFormData(prev => ({ ...prev, authorization: authDetails }));
  const handleAddParam = () => setFormData(prev => ({ ...prev, params: [...prev.params, { key: '', value: '' }] }));
  const handleAddHeader = () => setFormData(prev => ({ ...prev, headers: [...prev.headers, { key: '', value: '' }] }));

  return (
    <div className="api-tester-container">
      <h3>API Tester {selectedHistory && <span style={{fontSize: '0.7em', color: '#ff9800'}}>(기록 수정 중)</span>}</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <select value={formData.method} onChange={(e) => setFormData({ ...formData, method: e.target.value })}>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
          <input className="url-input" type="text" placeholder="https://api.example.com" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} />
        </div>

        <Authorization onAuthChange={handleAuthChange} initialAuth={formData.authorization} />

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