import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import axios from 'axios';

const FileUploader = ({ onResultsReceived }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [abortController] = useState(new AbortController()); // 1. 요청 취소 기능 추가

  // 2. 컴포넌트 언마운트 시 요청 취소
  useEffect(() => {
    return () => abortController.abort();
  }, []);

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
            const parsedData = results.data
              .map((row, index) => {
                try {
                  // 3. 필수 필드 검증 강화
                  if (!row.method || !row.url) {
                    throw new Error(`행 ${index+1}: method와 url은 필수 입력값입니다`);
                  }

                  // 4. JSON 파싱 유틸리티 함수 분리
                  const parseJSONField = (fieldName, jsonStr) => {
                    try {
                      return jsonStr ? JSON.parse(jsonStr) : [];
                    } catch (e) {
                      const cleaned = jsonStr
                        .replace(/([{,])\s*(\w+):/g, '$1"$2":')
                        .replace(/:\s*'([^']*)'/g, ':"$1"');
                      return JSON.parse(cleaned);
                    }
                  };

                  return {
                    method: row.method.toUpperCase(), // 5. 메서드 대문자 통일
                    url: row.url,
                    userId: row.userId || localStorage.getItem("userId"),
                    params: parseJSONField('params', row.params),
                    headers: parseJSONField('headers', row.headers),
                    body: row.body ? parseJSONField('body', row.body) : ""
                  };
                } catch (e) {
                  console.error(`행 ${index+1} 처리 오류:`, e);
                  throw e; // 6. 오류 전파
                }
              })
              .filter(Boolean);

            if (parsedData.length === 0) {
              throw new Error("유효한 데이터가 없습니다.");
            }

            const response = await axios.post(
              `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081'}/api/bulk-test`,
              parsedData,
              { signal: abortController.signal } // 7. 요청 취소 신호 연결
            );

            // 8. 상세 에러 리포트 생성
            const errorResults = response.data.filter(r => r.statusCode >= 400);
            if (errorResults.length > 0) {
              setError({
                message: `${errorResults.length}건의 요청 실패`,
                details: errorResults // 9. 상세 오류 정보 저장
              });
            }

            onResultsReceived(response.data);

          } catch (err) {
            // 10. 백엔드 에러 메시지 우선 사용
            const errorMessage = err.response?.data?.errorMessage || err.message;
            setError({ 
              message: errorMessage,
              details: err.response?.data?.errors 
            });
          } finally {
            setLoading(false);
          }
        },
        error: (err) => {
          setError({ message: `CSV 파싱 오류: ${err.message}` });
          setLoading(false);
        }
      });
    } catch (err) {
      setError({ message: `파일 처리 오류: ${err.message}` });
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

      {/* 11. 상세 오류 표시 UI */}
      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          <div>{error.message}</div>
          {error.details && (
            <details style={{ marginTop: '5px' }}>
              <summary>상세 정보 보기</summary>
              <pre>{JSON.stringify(error.details, null, 2)}</pre>
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
