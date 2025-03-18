import React, { useState, useEffect } from 'react';
import './ApiTester.css';

const ApiTester = ({ selectedHistory, onSendRequest }) => {
  const [formData, setFormData] = useState({
    method: '',
    url: '',
    body: '',
  });

  // 선택된 히스토리가 변경되면 입력 필드를 업데이트
  useEffect(() => {
    if (selectedHistory) {
      setFormData({
        method: selectedHistory.method,
        url: selectedHistory.api_url,
        body: selectedHistory.body,
      });
    }
  }, [selectedHistory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = {
      id: Date.now(),
      method: formData.method,
      url: formData.url,
      body: formData.body,
      statusCode: 200, // 예시로 성공 상태 코드 설정
    };
    onSendRequest(result); // 부모 컴포넌트로 결과 전달
  };

  return (
    <div>
      <h3>API Tester</h3>
      <form onSubmit={handleSubmit}>
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
          type="text" 
          value={formData.url} 
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
        />

        <label>Body:</label>
        <textarea 
          value={formData.body} 
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
        ></textarea>

        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ApiTester;
