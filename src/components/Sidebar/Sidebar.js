import React, { useEffect, useState } from "react";
import axios from '../../api/axiosInstance';
import './Sidebar.css';

const Sidebar = ({ onSelectHistory }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ 수정: 컴포넌트 마운트 시와 주기적으로 히스토리 목록 새로고침
  useEffect(() => {
    fetchHistory();
    
    // 10초마다 히스토리 자동 새로고침 (선택사항)
    const intervalId = setInterval(fetchHistory, 10000);
    
    // 컴포넌트 언마운트 시 interval 정리
    return () => clearInterval(intervalId);
  }, []);

  // ✅ 수정: 히스토리 데이터 가져오기 함수
  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 백엔드 API 호출
      const response = await axios.get('/api/history');
      console.log('히스토리 데이터:', response.data);
      setHistory(response.data);
    } catch (err) {
      console.error('히스토리 조회 실패:', err);
      setError('히스토리를 불러올 수 없습니다. 로그인 상태를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ 수정: 수동으로 새로고침하는 버튼 추가
  const handleRefresh = () => {
    fetchHistory();
  };

  return (
    <div className="sidebar-container">
      <h3>API History</h3>
      
      {/* 새로고침 버튼 */}
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
      
      {/* 로딩 상태 표시 */}
      {loading && <p>로딩 중...</p>}
      
      {/* 오류 메시지 */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {/* 히스토리가 없는 경우 */}
      {!loading && !error && history.length === 0 && (
        <p>저장된 API 히스토리가 없습니다.</p>
      )}
      
      {/* 히스토리 목록 */}
      <ul className="history-list">
        {history.map(item => (
          <li 
            key={item.api_id} 
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
