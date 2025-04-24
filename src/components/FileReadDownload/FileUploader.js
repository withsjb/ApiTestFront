import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import axios from '../../api/axiosInstance';

const FileUploader = ({ onResultsReceived }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [abortController] = useState(new AbortController());

  useEffect(() => {
    return () => abortController.abort();
  }, [abortController]);

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
                if (!row.method || !row.url) {
                  throw new Error(`행 ${index + 1}: method와 url은 필수 입력값입니다`);
                }
                const parseJSONField = (jsonStr, fallback) => {
                  if (!jsonStr) return fallback;
                  try { return JSON.parse(jsonStr); } catch { return fallback; }
                };
                return {
                  method: row.method.toUpperCase(),
                  url: row.url,
                  userId: row.userId || localStorage.getItem("userId"),
                  params: parseJSONField(row.params, []),
                  headers: parseJSONField(row.headers, []),
                  body: row.body ? row.body : "",
                  authType: row.authType,
                  authData: parseJSONField(row.authData, {}),
                  token: row.token
                };
              })
              .filter(Boolean);

            if (parsedData.length === 0) {
              throw new Error("유효한 데이터가 없습니다.");
            }

            // ✅ 여기서 토큰을 반드시 포함!
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await axios.post(
              `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081'}/api/bulk-test`,
              parsedData,
              { headers, signal: abortController.signal }
            );

            const errorResults = response.data.details
              ? response.data.details.filter(r => r.statusCode >= 400)
              : [];
            if (errorResults.length > 0) {
              setError({
                message: `${errorResults.length}건의 요청 실패`,
                details: errorResults
              });
            }

            onResultsReceived(response.data.details || response.data);

          } catch (err) {
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
