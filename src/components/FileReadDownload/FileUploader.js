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
      // CSV 파일 파싱
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            // 파싱된 데이터를 서버로 전송
            const response = await axios.post(
              'http://localhost:8081/api/bulk-test',
              results.data
            );
            
            // 결과 처리
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
        }
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
