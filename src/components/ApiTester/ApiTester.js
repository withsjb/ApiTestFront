import React, { useState, useEffect } from 'react'; // React와 필요한 훅(useState, useEffect) 가져오기
import './ApiTester.css'; // 컴포넌트 스타일링을 위한 CSS 파일 가져오기
import Authorization from './Authorization'; // 현재 디렉토리 내의 Authorization.js를 가져오기


const ApiTester = ({ selectedHistory, onSendRequest }) => {
  // API 요청 데이터를 관리하는 상태
  const [formData, setFormData] = useState({
    method: '',         // HTTP 메서드 (GET, POST 등)
    url: '',            // 요청 URL
    authorization: '',  // Authorization 헤더 값
    params: [{ key: '', value: '' }], // Params 초기값 (key-value 쌍)
    headers: [{ key: '', value: '' }], // Headers 초기값 (key-value 쌍)
    body: '',           // 요청 본문 (JSON)
  });

  // Authorization 데이터 변경 처리 함수
  const handleAuthChange = (authDetails) => {
    setFormData({
      ...formData,
      authorization: authDetails // Authorization 컴포넌트에서 전달된 인증 데이터로 업데이트
    });
  };

  // 선택된 히스토리가 변경되면 입력 필드를 업데이트
  useEffect(() => {
    if (selectedHistory) {
      setFormData({
        method: selectedHistory.method,        // 이전에 선택된 HTTP 메서드
        url: selectedHistory.api_url,         // 이전에 선택된 URL
        authorization: selectedHistory.authorization || '', // Authorization 헤더 값
        params: selectedHistory.params || [{ key: '', value: '' }], // 이전에 설정된 Params 값
        headers: selectedHistory.headers || [{ key: '', value: '' }], // 이전에 설정된 Headers 값
        body: selectedHistory.body || '',     // 이전에 입력된 본문 데이터
      });
    }
  }, [selectedHistory]); // selectedHistory가 변경될 때마다 실행

  // 새로운 Param 추가 함수
  const handleAddParam = () => {
    setFormData({
      ...formData,
      params: [...formData.params, { key: '', value: '' }], // 빈 key-value 쌍 추가
    });
  };

  // 새로운 Header 추가 함수
  const handleAddHeader = () => {
    setFormData({
      ...formData,
      headers: [...formData.headers, { key: '', value: '' }], // 빈 key-value 쌍 추가
    });
  };

  // 폼 제출 처리 함수
  const handleSubmit = (e) => {
    e.preventDefault(); // 기본 폼 제출 동작 방지

    // 인증 정보 처리 개선
    let authHeader = {};
    if (formData.authorization && formData.authorization.authType) {
      if (formData.authorization.authType === 'Bearer Token' && formData.authorization.authData?.token) {
        authHeader = { key: 'Authorization', value: `Bearer ${formData.authorization.authData.token}` };
      } else if (formData.authorization.authType === 'Basic Auth') {
        // Basic Auth 처리
      }
      // 다른 인증 타입도 처리
    }
    
    // 빈 key-value 쌍 제거
    const cleanParams = formData.params.filter(p => p.key || p.value);
    const cleanHeaders = [...formData.headers.filter(h => h.key || h.value)];
    
    // 인증 헤더 추가
    if (authHeader.key) {
      cleanHeaders.push(authHeader);
    }

    const result = {
      userId: localStorage.getItem('userId'),  // 고유 ID 
      method: formData.method,  // HTTP 메서드
      url: formData.url,        // 요청 URL
      authorization: formData.authorization, // Authorization 헤더 값
      params: cleanParams,  // 쿼리 파라미터 배열
      headers: cleanHeaders,// HTTP 헤더 배열
      body: formData.body,      // 요청 본문 (JSON)
    };

    onSendRequest(result); // 부모 컴포넌트로 결과 전달
  };

  return (
    <div>
      <h3>API Tester</h3>
      
      {/* 폼 시작 */}
      <form onSubmit={handleSubmit}>
        
        {/* Method와 URL 입력 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
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

        {/* Authorization 컴포넌트 사용 */}
        <div style={{ marginBottom: '10px' }}>
          <Authorization onAuthChange={handleAuthChange} />
        </div>

        {/* Params 입력 */}
        <div style={{ marginBottom: '10px' }}>
          <label>Params:</label>
          {formData.params.map((param, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Key 입력 */}
              <input
                type="text"
                placeholder="Key"
                value={param.key}
                onChange={(e) => {
                  const newParams = [...formData.params];
                  newParams[index].key = e.target.value; // 해당 index의 key 업데이트
                  setFormData({ ...formData, params: newParams });
                }}
              />
              {/* Value 입력 */}
              <input
                type="text"
                placeholder="Value"
                value={param.value}
                onChange={(e) => {
                  const newParams = [...formData.params];
                  newParams[index].value = e.target.value; // 해당 index의 value 업데이트
                  setFormData({ ...formData, params: newParams });
                }}
              />
              {/* + 버튼 */}
              {index === formData.params.length - 1 && (
                <button type="button" onClick={handleAddParam}>+</button>
              )}
            </div>
          ))}
        </div>

        {/* Headers 입력 */}
        <div style={{ marginBottom: '10px' }}>
          <label>Headers:</label>
          {formData.headers.map((header, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Key 입력 */}
              <input
                type="text"
                placeholder="Key"
                value={header.key}
                onChange={(e) => {
                  const newHeaders = [...formData.headers];
                  newHeaders[index].key = e.target.value; // 해당 index의 key 업데이트
                  setFormData({ ...formData, headers: newHeaders });
                }}
              />
              {/* Value 입력 */}
              <input
                type="text"
                placeholder="Value"
                value={header.value}
                onChange={(e) => {
                  const newHeaders = [...formData.headers];
                  newHeaders[index].value = e.target.value; // 해당 index의 value 업데이트
                  setFormData({ ...formData, headers: newHeaders });
                }}
              />
              {/* + 버튼 */}
              {index === formData.headers.length - 1 && (
                <button type="button" onClick={handleAddHeader}>+</button>
              )}
            </div>
          ))}
        </div>

       {/* Body와 Send 버튼 */}
       <div style={{ marginBottom: '10px' }}>
          <label>Body:</label>
          <textarea 
            placeholder="Enter request body"
            value={formData.body} 
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            rows="4"
            style={{ width: '100%', marginBottom: '10px' }}
          ></textarea>

          {/* Send 버튼을 Body 박스 오른쪽 아래에 배치 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit">Send</button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default ApiTester;