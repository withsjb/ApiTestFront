import React, { useState } from 'react';
import Papa from 'papaparse'; // CSV 파일 파싱을 위한 라이브러리
import axios from 'axios';

const FileUploader = ({ onResultsReceived }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('파일을 선택해주세요.');
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            // ✅ 인증 타입별 데이터 처리 개선
            const parsedData = results.data.map((row) => {
              // ✅ JSON 파싱 오류 안전하게 처리
              const parseJsonField = (field, defaultValue = []) => {
                try {
                  return field ? JSON.parse(field) : defaultValue;
                } catch (e) {
                  throw new Error(`${field} 필드의 JSON 형식이 올바르지 않습니다.`);
                }
              };
              
              return {
                method: row.method,
                url: row.url,
                authType: row.authType || 'No Auth', // 기본값 설정
                // ✅ 인증 타입에 따라 필요한 데이터만 포함
                ...(row.authType === 'Bearer Token' && { token: row.token }),
                // ✅ 인증 데이터 구조화
                authData: {
                  ...(row.authType === 'Basic Auth' && { 
                    username: row.username, 
                    password: row.password 
                  }),
                  ...(row.authType === 'API Key' && { 
                    key: row.key, 
                    value: row.value 
                  })
                },
                params: parseJsonField(row.params),
                headers: parseJsonField(row.headers),
                body: row.body || '',
              };
            });
  
            // ✅ API 엔드포인트 환경변수 사용
            const response = await axios.post(
              `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081'}/api/bulk-test`,
              parsedData,
              {
                headers: {
                  'Content-Type': 'application/json',
                }
              }
            );
  
            onResultsReceived(response.data);
            setLoading(false);
          } catch (err) {
            setError('API 요청 중 오류가 발생했습니다: ' + err.message);
            setLoading(false);
          }
        },
        error: (err) => {
          setError('파일 파싱 중 오류가 발생했습니다: ' + err.message);
          setLoading(false);
        },
      });
    } catch (err) {
      setError('파일 처리 중 오류가 발생했습니다: ' + err.message);
      setLoading(false);
    }
  };
  
  return (
    <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '4px' }}>
      <h3>대량 API 테스트</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange}
          style={{ flex: 1 }}
        />
        <button 
          onClick={handleUpload}
          disabled={loading || !file}
          style={{ 
            padding: '5px 10px',
            backgroundColor: loading ? '#ccc' : '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '처리 중...' : '업로드 및 테스트 실행'}
        </button>
      </div>
      
      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          {error}
        </div>
      )}
      
      {file && (
        <div style={{ marginTop: '10px' }}>
          <strong>선택된 파일:</strong> {file.name}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
