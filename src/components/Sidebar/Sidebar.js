import React, { useEffect, useState } from "react";
import axios from '../../api/axiosInstance';
import './Sidebar.css';

// ✅ 표준 임포트 방식 (에러 방지)
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrashCan, faArrowRotateRight } from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ onSelectHistory, onRefresh, refreshTrigger }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
    const intervalId = setInterval(fetchHistory, 600000);
    return () => clearInterval(intervalId);
  }, [refreshTrigger]); // 트리거 변경 시 새로고침

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/history');
      const uniqueData = response.data.map((item, index) => ({
        ...item,
        safeKey: item.apiId ?? `temp-${index}`
      }));
      setHistory(uniqueData);
    } catch (err) {
      console.error('히스토리를 불러올 수 없습니다.', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, apiId) => {
    e.stopPropagation();
    if (!window.confirm("이 기록을 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`/api/history/${apiId}`);
      fetchHistory();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("삭제 실패");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('ko-KR', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="sidebar-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>API History</h3>
        {/* 새로고침 아이콘 버튼 */}
        <button 
          onClick={fetchHistory} 
          className="icon-refresh-btn" 
          title="새로고침"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
        >
          <FontAwesomeIcon icon={faArrowRotateRight} spin={loading} />
        </button>
      </div>

      <ul className="history-list" style={{ listStyle: 'none', padding: 0 }}>
        {history.map(item => (
          <li 
            key={item.safeKey}
            onClick={() => onSelectHistory(item)}
            className="history-item"
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer',
              padding: '10px',
              borderBottom: '1px solid #eee'
            }}
          >
            {/* 기존 정보 표시 형태 유지 */}
            <div style={{ flex: 1, overflow: 'hidden', marginRight: '10px' }}>
              <strong style={{ color: '#333' }}>{item.method}</strong> - 
              <span style={{ marginLeft: '5px', fontSize: '0.9em', color: '#555' }}>{item.apiUrl}</span>
              <br />
              <span style={{ fontSize: '0.75em', color: '#999' }}>{formatDate(item.createdAt)}</span>
            </div>

            {/* 🔥 아이콘 버튼 영역 */}
            <div className="item-actions" style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); onSelectHistory(item); }}
                title="수정" // 마우스 오버 시 툴팁
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2196F3', fontSize: '1.1em' }}
              >
                <FontAwesomeIcon icon={faPenToSquare} />
              </button>
              <button 
                onClick={(e) => handleDelete(e, item.apiId)} 
                title="삭제" // 마우스 오버 시 툴팁
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f44336', fontSize: '1.1em' }}
              >
                <FontAwesomeIcon icon={faTrashCan} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;