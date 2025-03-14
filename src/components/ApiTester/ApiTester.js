import React, { useState } from 'react';
import axios from 'axios';
import './ApiTester.css';

function ApiTester() {
  const [method, setMethod] = useState('POST'); // 기본 HTTP 메서드 설정
  const [url, setUrl] = useState('');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState('');

  // API 요청을 처리하는 함수
  const handleSendRequest = async () => {
    try {
      const config = {
        method: method, // HTTP 메서드 (POST, GET 등)
        url: 'http://localhost:8081/api/test', // Spring Boot 엔드포인트
        headers: { 'Content-Type': 'application/json' }, // 요청 헤더 설정
        data: { method, url, body }, // 요청 데이터
      };

      const res = await axios(config); // Axios를 사용하여 API 호출
      setResponse(JSON.stringify(res.data, null, 2)); // 응답 데이터를 JSON 형식으로 저장
    } catch (error) {
      setResponse(error.message); // 에러 메시지 처리
    }
  };

  return (
    <div className="api-tester">
      <div className="input-group">
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
        <input
          type="text"
          placeholder="URL 입력"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <textarea
        placeholder="Body 입력"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <button onClick={handleSendRequest}>Send</button>
      <pre>{response}</pre>
    </div>
  );
}

export default ApiTester;
