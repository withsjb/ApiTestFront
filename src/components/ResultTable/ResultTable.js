import React from 'react';
import './ResultTable.css';

function ResultTable({ results }) {
  return (
    <table className="result-table">
      <thead>
        <tr>
          <th>Testcase ID</th>
          <th>요약</th>
          <th>API Endpoint</th>
          <th>HTTP Method</th>
          <th>응답 코드</th>
          <th>성공 여부</th>
        </tr>
      </thead>
      <tbody>
        {results.map((result, index) => (
          <tr key={index}>
            <td>{result.id}</td>
            <td>{result.summary}</td>
            <td>{result.endpoint}</td>
            <td>{result.method}</td>
            <td>{result.statusCode}</td>
            <td>{result.success ? '성공' : '실패'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ResultTable;
