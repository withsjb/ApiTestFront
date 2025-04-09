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
            const parsedData = results.data.map((row) => ({
              method: row.method,
              url: row.url,
              userId: row.userId || localStorage.getItem("userId"), // ✅ 사용자 ID 추가
              params: JSON.parse(row.params || '[]'),
              headers: JSON.parse(row.headers || '[]'),
              body: row.body || '',
            }));
  
            const response = await axios.post(
              `${process.env.REACT_APP_API_BASE_URL}/api/bulk-test`,
              parsedData,
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
