import React, { useState, useEffect } from 'react';
import './ApiTester.css';
import Authorization from './Authorization';

const ApiTester = ({ selectedHistory, onSendRequest, onSaveToHistory }) => {
  
  const [formData, setFormData] = useState({
    method: 'GET',
    url: '',
    authorization: '',
    params: [{ key: '', value: '' }],
    headers: [{ key: '', value: '' }],
    body: '',
  });

  // ======================================
  // 🔹 선택된 히스토리 → 폼 자동 채우기
  // ======================================
  useEffect(() => {
    if (selectedHistory) {
      try {
        const newValues = {
          method: selectedHistory.method,
          url: selectedHistory.api_url,
          authorization: selectedHistory.authorization || '',
          params: parseJSONField(selectedHistory.params),
          headers: parseJSONField(selectedHistory.headers),
          body: selectedHistory.body || '',
        };

        setFormData(newValues);
      } catch (e) {
        console.error('히스토리 파싱 실패:', e);
      }
    }
  }, [selectedHistory?.api_id]);

  const parseJSONField = (field) => {
    if (!field) return [{ key: '', value: '' }];
    return typeof field === 'string' ? JSON.parse(field) : field;
  };

  // ======================================
  // 🔹 값 저장 버튼 누르면 부모 함수 호출
  // ======================================
  const handleSave = () => {
    if (!onSaveToHistory) {
      return alert("저장 기능이 연결되지 않았습니다.");
    }
    onSaveToHistory(formData);
  };

  // ======================================
  // 🔹 인증 컴포넌트 변경 처리
  // ======================================
  const handleAuthChange = (authDetails) => {
    setFormData(prev => ({
      ...prev,
      authorization: authDetails
    }));
  };

  const handleAddParam = () => {
    setFormData(prev => ({
      ...prev,
      params: [...prev.params, { key: '', value: '' }],
    }));
  };

  const handleAddHeader = () => {
    setFormData(prev => ({
      ...prev,
      headers: [...prev.headers, { key: '', value: '' }],
    }));
  };

  // ======================================
  // 🔹 폼 제출 → API 요청 실행
  // ======================================
  const handleSubmit = (e) => {
    e.preventDefault();

    let authHeader = {};
    if (formData.authorization?.authType === 'Bearer Token') {
      authHeader = {
        key: 'Authorization',
        value: `Bearer ${formData.authorization.authData?.token || ''}`
      };
    }

    const cleanParams = formData.params.filter(p => p.key || p.value);
    const cleanHeaders = [
      ...formData.headers.filter(h => h.key || h.value)
    ];

    if (authHeader.key) cleanHeaders.push(authHeader);

    const finalData = {
      userId: localStorage.getItem('userId'),
      method: formData.method,
      url: formData.url,
      authorization: formData.authorization,
      params: cleanParams,
      headers: cleanHeaders,
      body: formData.body,
    };

    onSendRequest(finalData);
  };

  return (
    <div>
      <h3>API Tester</h3>

      <form onSubmit={handleSubmit}>
        
        {/* ---------------- Method + URL ---------------- */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <label>Method:</label>
          <select
            value={formData.method}
            onChange={(e) => setFormData({ ...formData, method: e.target.value })}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>

          <label>URL:</label>
          <input
            className="url-input"
            type="text"
            placeholder="Enter URL"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          />
        </div>

        {/* ---------------- Authorization ---------------- */}
        <div style={{ marginBottom: '10px' }}>
          <Authorization onAuthChange={handleAuthChange} />
        </div>

        {/* ---------------- Params ---------------- */}
        <div style={{ marginBottom: '10px' }}>
          <label>Params:</label>
          {formData.params.map((p, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Key"
                value={p.key}
                onChange={(e) => {
                  const newList = [...formData.params];
                  newList[idx].key = e.target.value;
                  setFormData({ ...formData, params: newList });
                }}
              />
              <input
                type="text"
                placeholder="Value"
                value={p.value}
                onChange={(e) => {
                  const newList = [...formData.params];
                  newList[idx].value = e.target.value;
                  setFormData({ ...formData, params: newList });
                }}
              />

              {idx === formData.params.length - 1 && (
                <button type="button" onClick={handleAddParam}>+</button>
              )}
            </div>
          ))}
        </div>

        {/* ---------------- Headers ---------------- */}
        <div style={{ marginBottom: '10px' }}>
          <label>Headers:</label>
          {formData.headers.map((h, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Key"
                value={h.key}
                onChange={(e) => {
                  const newList = [...formData.headers];
                  newList[idx].key = e.target.value;
                  setFormData({ ...formData, headers: newList });
                }}
              />
              <input
                type="text"
                placeholder="Value"
                value={h.value}
                onChange={(e) => {
                  const newList = [...formData.headers];
                  newList[idx].value = e.target.value;
                  setFormData({ ...formData, headers: newList });
                }}
              />

              {idx === formData.headers.length - 1 && (
                <button type="button" onClick={handleAddHeader}>+</button>
              )}
            </div>
          ))}
        </div>

        {/* ---------------- Body ---------------- */}
        <div style={{ marginBottom: '10px' }}>
          <label>Body:</label>
          <textarea
            placeholder="Enter request body"
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            rows="6"
          />
        </div>

        {/* ---------------- Buttons ---------------- */}
        <div style={{ marginTop: '10px' }}>
          <button type="submit">Send</button>
          <button type="button" style={{ marginLeft: '10px' }} onClick={handleSave}>
            값 저장하기
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApiTester;