import React from 'react';
import './ResultTable.css';

// ✅ 응답 메시지를 가로 스크롤 없이 줄바꿈 처리하는 스타일 객체
const responseBoxStyle = {
  maxWidth: 400,           // 최대 너비 제한 (원하는 값으로 조절)
  whiteSpace: 'pre-wrap',  // 줄바꿈과 공백 유지
  wordBreak: 'break-all',  // 긴 단어도 줄바꿈
  background: '#f7f7f7',
  padding: '8px',
  borderRadius: '4px',
  fontFamily: 'monospace',
  margin: 0
};

const ResultTable = ({ results }) => {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid #ccc' }}>
          <th>Testcase ID</th>
          <th>HTTP Method</th>
          <th>API Endpoint</th>
          <th>Body</th>
          <th>Status Code</th>
          <th>Response Time</th>
          <th>Response</th>
        </tr>
      </thead>
      <tbody>
        {results.map((result, index) => (
          <tr key={index}>
            <td>{result.testcaseId}</td>
            <td>{result.method}</td>
            <td>{result.url}</td>
            <td>
              {/* Body가 문자열이면 일부만, 아니면 JSON으로 일부만 보여줌 */}
              {result.body
                ? (typeof result.body === 'string'
                    ? result.body.substring(0, 30)
                    : JSON.stringify(result.body).substring(0, 30))
                : ''}
            </td>
            <td>{result.statusCode}</td>
            <td>{result.reponse_time}</td>
            <td>
              {result.responseBody ? (
                <details>
                  <summary>응답 보기</summary>
                  {/* ✅ <pre> 대신 <div>에 스타일 적용 */}
                  <div style={responseBoxStyle}>
                    {typeof result.responseBody === 'object'
                      ? JSON.stringify(result.responseBody, null, 2)
                      : result.responseBody}
                  </div>
                </details>
              ) : (
                '응답 없음'
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ResultTable;
