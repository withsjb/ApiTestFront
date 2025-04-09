import React from 'react';
import './ResultTable.css';

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
        </tr>
      </thead>
      <tbody>
        {results.map((result, index) => (
          <tr key={index}>
            <td>{result.testcaseId}</td>
            <td>{result.method}</td>
            <td>{result.url}</td>
            <td>{result.body}</td>
            <td>{result.statusCode}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ResultTable;