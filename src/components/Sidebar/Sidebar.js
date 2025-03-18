import React, { useEffect, useState } from "react";
import axios from "axios";
import './Sidebar.css';

const Sidebar = ({ onSelectHistory }) => {
  const [history, setHistory] = useState([]);

  // API 요청으로 히스토리 데이터 가져오기
  useEffect(() => {
    axios.get('http://localhost:8081/api/history')
      .then(response => {
        setHistory(response.data); // 히스토리 데이터를 상태에 저장
      })
      .catch(error => {
        console.error('Error fetching history:', error);
      });
  }, []);

  return (
    <div>
      <h3>API History</h3>
      <ul>
        {history.map(item => (
          <li 
            key={item.api_id} 
            onClick={() => onSelectHistory(item)} // 클릭 시 데이터 전달
            style={{ cursor: 'pointer', padding: '10px', borderBottom: '1px solid #ccc' }}
          >
            <strong>{item.method}</strong> - {item.api_url} ({item.statusCode})
            <br />
            <span style={{ fontSize: '0.8em', color: '#888' }}>
              Created at: {new Date(item.created_at).toLocaleString()} {/* 생성 날짜 표시 */}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;

