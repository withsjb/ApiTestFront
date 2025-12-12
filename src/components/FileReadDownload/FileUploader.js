import React, { useState } from 'react';
import axios from '../../api/axiosInstance'; // 경로가 맞는지 확인해주세요

const FileUploader = ({ onResultsReceived }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleUpload = async () => {
    // 1. 파일 선택 여부 확인
    if (!file) {
      setError('파일을 선택해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // ---------------------------------------------------------
      // [수정된 부분] userId를 localStorage에서 가져와서 추가
      // ---------------------------------------------------------
      // 로그인 시 저장한 키 값(예: 'userId', 'id' 등)과 일치해야 합니다.
      // const userId = localStorage.getItem('userId'); 
      
      // if (userId) {
      //   formData.append('userId', userId);
      // } else {
      //   // userId가 없으면 백엔드에서 에러가 나므로 미리 차단
      //   throw new Error('로그인 사용자 정보(userId)를 찾을 수 없습니다. 다시 로그인해주세요.');
      // }
      // ---------------------------------------------------------

      // Authorization 토큰 헤더 설정
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // Content-Type은 FormData 전송 시 브라우저가 자동으로 'multipart/form-data'로 설정하므로
      // 별도로 지정하지 않아도 됩니다 (axios가 처리).

      const base = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';
      
      // 요청 전송
      const res = await axios.post(`${base}/api/bulk-test`, formData, { headers });

      // 결과 처리
      const details = res.data.details || res.data.results || res.data;
      if (onResultsReceived) {
        onResultsReceived(details);
      }

    } catch (err) {
      // 에러 처리 로직
      const serverMsg = err.response?.data?.message || err.response?.data?.errorMessage;
      
      // 직접 throw new Error() 한 경우와 Axios 에러 구분
      const errorMessage = serverMsg || err.message || '업로드 중 오류가 발생했습니다.';

      setError({
        message: errorMessage,
        details: err.response?.data ?? null
      });
      
      console.error('bulk upload error:', err);
    } finally {
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
          disabled={loading}
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
          <div>{error.message || error}</div>
          {error.details && (
            <details style={{ marginTop: '5px' }}>
              <summary>상세 정보 보기</summary>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(error.details, null, 2)}</pre>
            </details>
          )}
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