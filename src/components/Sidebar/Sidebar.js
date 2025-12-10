import React, { useEffect, useState } from "react";
import axios from '../../api/axiosInstance';
import './Sidebar.css';

const Sidebar = ({ onSelectHistory }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();

    // 10분마다 히스토리 자동 새로고침
    const intervalId = setInterval(fetchHistory, 600000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/history');
      const data = response.data;

      // 안전하게 key를 위해 중복 방지 및 id 없는 항목 처리
      const uniqueData = data.map((item, index) => ({
        ...item,
        safeKey: item.api_id ?? `temp-${index}`  // api_id 없으면 임시 key
      }));

      setHistory(uniqueData);
    } catch (err) {
      console.error('히스토리 조회 실패:', err);
      setError('히스토리를 불러올 수 없습니다. 로그인 상태를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchHistory();
  };

  return (
    <div className="sidebar-container">
      <h3>API History</h3>

      <button 
        onClick={handleRefresh} 
        style={{ 
          padding: '4px 8px', 
          marginBottom: '10px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        새로고침
      </button>

      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && history.length === 0 && <p>저장된 API 히스토리가 없습니다.</p>}

      <ul className="history-list">
        {history.map(item => (
          <li 
            key={item.safeKey}  // 안전한 key 사용
            onClick={() => onSelectHistory(item)}
            style={{ cursor: 'pointer', padding: '10px', borderBottom: '1px solid #ccc' }}
          >
            <strong>{item.method}</strong> - {item.url}
            <br />
            <span style={{ fontSize: '0.8em', color: '#888' }}>
              {new Date(item.created_at).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
