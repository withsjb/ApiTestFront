import React, { useState, useEffect } from 'react'; // React와 필요한 훅(useState, useEffect) 가져오기
import './ApiTester.css'; // 컴포넌트 스타일링을 위한 CSS 파일 가져오기
import Authorization from './Authorization'; // 현재 디렉토리 내의 Authorization.js를 가져오기


// ✅ onSaveToHistory prop 추가 - 값 저장하기 기능을 위해 필요
const ApiTester = ({ selectedHistory, onSendRequest, onSaveToHistory }) => {
  // API 요청 데이터를 관리하는 상태
  const [formData, setFormData] = useState({
    method: 'GET',         // HTTP 메서드 기본값 설정
    url: '',            // 요청 URL
    authorization: '',  // Authorization 헤더 값
    params: [{ key: '', value: '' }], // Params 초기값 (key-value 쌍)
    headers: [{ key: '', value: '' }], // Headers 초기값 (key-value 쌍)
    body: '',           // 요청 본문 (JSON)
  });

  // ✅ selectedHistory 변경 시 효과적으로 처리
  useEffect(() => {
    if (selectedHistory) {
      try {
        const newFormData = {
          method: selectedHistory.method,
          url: selectedHistory.api_url,
          authorization: selectedHistory.authorization || '',
          params: parseJSONField(selectedHistory.params),
          headers: parseJSONField(selectedHistory.headers),
          body: selectedHistory.body || '',
        };
        setFormData(newFormData);
      } catch (e) {
        console.error('히스토리 데이터 파싱 실패:', e);
        resetFormData();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHistory?.api_id]); // ✅ api_id 기반으로 최적화

  // JSON 파싱 유틸리티 함수
  const parseJSONField = (field) => {
    if (!field) return [{ key: '', value: '' }];
    return typeof field === 'string' ? JSON.parse(field) : field;
  };

  // 폼 초기화 함수
  const resetFormData = () => {
    setFormData({
      method: 'GET',
      url: '',
      authorization: '',
      params: [{ key: '', value: '' }],
      headers: [{ key: '', value: '' }],
      body: '',
    });
  };

  // ✅ "값 저장하기" 버튼 클릭 시 - 오류 처리 추가
  const handleSave = () => {
    // onSaveToHistory가 prop으로 전달되었는지 확인
    if (onSaveToHistory) {
      // 현재 formData를 히스토리로 저장 요청
      onSaveToHistory(formData);
    } else {
      // 저장 함수가 전달되지 않았을 경우 오류 처리
      console.error('저장 기능이 제공되지 않았습니다.');
      alert('저장 기능을 사용할 수 없습니다. App.js에서 onSaveToHistory를 확인해주세요.');
    }
  };

  // Authorization 데이터 변경 처리 함수
  const handleAuthChange = (authDetails) => {
    setFormData({
      ...formData,
      authorization: authDetails // Authorization 컴포넌트에서 전달된 인증 데이터로 업데이트
    });
  };

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
        // Basic Auth 처리 - 추후 구현
      }
      // 다른 인증 타입도 처리 - 추후 구현
    }
    
    // 빈 key-value 쌍 제거
    const cleanParams = formData.params.filter(p => p.key || p.value);
    const cleanHeaders = [...formData.headers.filter(h => h.key || h.value)];
    
    // 인증 헤더 추가
    if (authHeader.key) {
      cleanHeaders.push(authHeader);
    }

    // ✅ DB 스키마와 일치하도록 필드명 수정 (api_requests 테이블 구조 반영)
    const result = {
      userId: localStorage.getItem('userId'),  // 사용자 ID (DB 컬럼: users_id)
      method: formData.method,                 // HTTP 메서드 (DB 컬럼: method)
      url: formData.url,                       // 요청 URL (DB 컬럼: api_url)
      authorization: formData.authorization,   // 인증 정보 (DB 컬럼: authorization)
      params: cleanParams,                     // 쿼리 파라미터 (DB 컬럼: params - JSON으로 저장)
      headers: cleanHeaders,                   // HTTP 헤더 (DB 컬럼: headers - JSON으로 저장)
      body: formData.body,                     // 요청 본문 (DB 컬럼: body)
    };

    onSendRequest(result); // 부모 컴포넌트로 결과 전달 (API 요청 실행)
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

       {/* Body와 버튼들 */}
       <div style={{ marginBottom: '10px' }}>
          <label>Body:</label>
          <textarea 
            placeholder="Enter request body"
            value={formData.body} 
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            rows="4"
            style={{ width: '100%', marginBottom: '10px' }}
          ></textarea>

          {/* ✅ 버튼 영역에 "값 저장하기" 버튼 추가 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            {/* 값 저장하기 버튼 추가 */}
            <button 
              type="button" 
              onClick={handleSave}
              style={{
                padding: '5px 10px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              값 저장하기
            </button>
            
            {/* 기존 Send 버튼 */}
            <button 
              type="submit"
              style={{
                padding: '5px 10px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Send
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ApiTester;
