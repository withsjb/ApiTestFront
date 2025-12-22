import React, { useEffect, useState } from "react";
import axios from '../../api/axiosInstance';
import './Sidebar.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPenToSquare, faTrashCan, faArrowRotateRight, 
  faFolder, faFolderOpen, faChevronRight, faChevronDown, faPlus, faShareFromSquare
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ onSelectHistory, onRefresh, refreshTrigger }) => {
  const [history, setHistory] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openCollections, setOpenCollections] = useState({});
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [movingItemId, setMovingItemId] = useState(null); 
  const userId = 1; 

  useEffect(() => {
    fetchAllData();
    const intervalId = setInterval(fetchAllData, 600000);
    return () => clearInterval(intervalId);
  }, [refreshTrigger]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [colRes, histRes] = await Promise.all([
        axios.get(`/api/collections?userId=${userId}`),
        axios.get('/api/history')
      ]);

      setCollections(colRes.data);
      const uniqueData = histRes.data.map((item, index) => ({
        ...item,
        safeKey: item.apiId ?? `temp-${index}`
      }));
      setHistory(uniqueData);
    } catch (err) {
      console.error('데이터를 불러올 수 없습니다.', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 폴더 생성
  const handleCreateCollection = async () => {
    if (!newFolderName.trim()) return;
    try {
        await axios.post('/api/collections', {
            name: newFolderName,
            userId: userId,
            sortOrder: collections.length 
        });
        setNewFolderName("");
        setIsModalOpen(false);
        fetchAllData(); 
    } catch (err) {
        alert("폴더 생성에 실패했습니다.");
    }
  };

  // ✅ 폴더 삭제 기능 추가
  const handleDeleteCollection = async (e, collectionId) => {
    e.stopPropagation(); // 폴더 토글 방지
    if (!window.confirm("이 폴더를 삭제하시겠습니까? (폴더 안의 기록은 유지됩니다.)")) return;
    
    try {
      await axios.delete(`/api/collections/${collectionId}`);
      fetchAllData(); // 삭제 후 목록 새로고침
    } catch (err) {
      console.error("폴더 삭제 실패:", err);
      alert("폴더 삭제에 실패했습니다.");
    }
  };

  // ✅ 폴더 이동 처리
  const handleMoveItem = async (item, targetCollectionId) => {
    try {
      const refinedItem = {
        ...item, 
        url: item.url || item.apiUrl, 
        collectionId: targetCollectionId,
        params: typeof item.params === 'string' ? JSON.parse(item.params || '[]') : item.params,
        headers: typeof item.headers === 'string' ? JSON.parse(item.headers || '[]') : item.headers,
        authData: typeof item.authData === 'string' ? JSON.parse(item.authData || '{}') : item.authData
      };

      await axios.put(`/api/history/${item.apiId}`, refinedItem);
      setMovingItemId(null);
      fetchAllData();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("이동 실패 상세:", err);
      const errorMsg = err.response?.data?.message || "데이터 형식이 올바르지 않습니다.";
      alert(`폴더 이동 실패: ${errorMsg}`);
    }
  };

  const toggleCollection = (e, id) => {
    e.stopPropagation();
    setOpenCollections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (e, apiId) => {
    e.stopPropagation();
    if (!window.confirm("이 기록을 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/history/${apiId}`);
      fetchAllData();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("삭제 실패");
    }
  };

  const renderHistoryItem = (item) => (
    <li key={item.safeKey} style={{ borderBottom: '1px solid #f0f0f0', listStyle: 'none' }}>
      <div 
        className="history-item"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '8px 10px' }}
        onClick={() => onSelectHistory(item)}
      >
        <div style={{ flex: 1, overflow: 'hidden', marginRight: '5px' }}>
          <strong className={`method-${item.method}`} style={{ fontSize: '0.8em' }}>{item.method}</strong>
          <span style={{ marginLeft: '5px', fontSize: '0.8em', color: '#555' }}>{item.apiUrl}</span>
        </div>
        <div className="item-actions" style={{ display: 'flex', gap: '5px' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); setMovingItemId(movingItemId === item.apiId ? null : item.apiId); }} 
            title="이동" 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF9800' }}
          >
            <FontAwesomeIcon icon={faShareFromSquare} />
          </button>
          <button onClick={(e) => handleDelete(e, item.apiId)} title="삭제" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f44336' }}>
            <FontAwesomeIcon icon={faTrashCan} />
          </button>
        </div>
      </div>

      {movingItemId === item.apiId && (
        <div style={{ padding: '8px', background: '#f9f9f9', borderTop: '1px dashed #ddd' }}>
          <div style={{ fontSize: '0.7em', color: '#888', marginBottom: '5px' }}>폴더 선택:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            <button 
              onClick={() => handleMoveItem(item, null)}
              style={{ fontSize: '0.7em', padding: '2px 5px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '3px' }}
            >
              미분류
            </button>
            {collections.map(col => (
              <button 
                key={col.collectionId}
                onClick={() => handleMoveItem(item, col.collectionId)}
                style={{ fontSize: '0.7em', padding: '2px 5px', cursor: 'pointer', border: '1px solid #4CAF50', borderRadius: '3px', color: '#4CAF50' }}
              >
                {col.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </li>
  );

  return (
    <div className="sidebar-container" style={{ padding: '15px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>Workspace</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setIsModalOpen(true)} title="새 폴더 추가" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#4CAF50' }}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
          <button onClick={fetchAllData} className="icon-refresh-btn" title="새로고침" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
            <FontAwesomeIcon icon={faArrowRotateRight} spin={loading} />
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'absolute', top: '50px', left: '15px', right: '15px', background: 'white', border: '1px solid #ddd', padding: '15px', zIndex: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>새 폴더</h4>
          <input 
            autoFocus style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
            value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
            placeholder="이름 입력..."
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '5px' }}>
            <button onClick={handleCreateCollection} style={{ padding: '5px 10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}>생성</button>
            <button onClick={() => setIsModalOpen(false)} style={{ padding: '5px 10px', background: '#ccc', border: 'none', borderRadius: '4px' }}>취소</button>
          </div>
        </div>
      )}

      {/* COLLECTIONS */}
      <div className="sidebar-section">
        <h4 style={{ color: '#888', fontSize: '0.8em', marginBottom: '10px' }}>COLLECTIONS</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {collections.map(col => (
            <li key={col.collectionId} style={{ marginBottom: '5px' }}>
              <div 
                onClick={(e) => toggleCollection(e, col.collectionId)}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  cursor: 'pointer', padding: '8px 10px', borderRadius: '4px', background: '#f8f9fa' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FontAwesomeIcon icon={openCollections[col.collectionId] ? faChevronDown : faChevronRight} style={{ fontSize: '0.7em', marginRight: '8px', color: '#aaa' }} />
                  <FontAwesomeIcon icon={openCollections[col.collectionId] ? faFolderOpen : faFolder} style={{ marginRight: '8px', color: '#ffca28' }} />
                  <span style={{ fontSize: '0.9em', fontWeight: 'bold' }}>{col.name}</span>
                </div>

                {/* ✅ 폴더 삭제 버튼 추가 (기록 삭제와 동일한 faTrashCan 아이콘) */}
                <div className="item-actions">
                  <button 
                    onClick={(e) => handleDeleteCollection(e, col.collectionId)}
                    title="폴더 삭제"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f44336' }}
                  >
                    <FontAwesomeIcon icon={faTrashCan} />
                  </button>
                </div>
              </div>
              
              {openCollections[col.collectionId] && (
                <ul style={{ listStyle: 'none', paddingLeft: '15px', marginTop: '5px' }}>
                  {history.filter(h => h.collectionId === col.collectionId).length > 0 ? (
                    history.filter(h => h.collectionId === col.collectionId).map(item => renderHistoryItem(item))
                  ) : (
                    <li style={{ padding: '10px', fontSize: '0.8em', color: '#ccc', textAlign: 'center' }}>비어있음</li>
                  )}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      <hr style={{ border: '0.5px solid #eee', margin: '20px 0' }} />

      {/* UNCLASSIFIED */}
      <div className="sidebar-section">
        <h4 style={{ color: '#888', fontSize: '0.8em', marginBottom: '10px' }}>UNCLASSIFIED</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {history.filter(h => h.collectionId === null).map(item => renderHistoryItem(item))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;