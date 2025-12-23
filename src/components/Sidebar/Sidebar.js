import React, { useEffect, useState } from "react";
import axios from '../../api/axiosInstance';
import './Sidebar.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPenToSquare, faTrashCan, faArrowRotateRight, 
  faFolder, faFolderOpen, faChevronRight, faChevronDown, faPlus, faShareFromSquare,
  faPlay 
} from '@fortawesome/free-solid-svg-icons';

// ✅ 부모(App.js)로부터 collections와 setCollections를 props로 받습니다.
const Sidebar = ({ collections, setCollections, onSelectHistory, onRefresh, refreshTrigger, onBulkResults }) => {
  const [history, setHistory] = useState([]);
  // const [collections, setCollections] = useState([]); // ❌ 이 줄을 삭제했습니다.
  const [loading, setLoading] = useState(false);
  const [openCollections, setOpenCollections] = useState({});
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); 
  const [folderNameInput, setFolderNameInput] = useState("");
  const [editingCollectionId, setEditingCollectionId] = useState(null);

  const [folderAuth, setFolderAuth] = useState({
    authType: 'No Auth',
    token: '',
    username: '',
    password: '',
    apiKey: '',
    apiValue: ''
  });
  
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

      // ✅ 부모의 상태를 업데이트하여 App.js에서도 최신 폴더 목록을 알게 합니다.
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

  const openModal = (mode, collection = null) => {
    setModalMode(mode);
    if (mode === "edit" && collection) {
      setEditingCollectionId(collection.collectionId);
      setFolderNameInput(collection.name);
      setFolderAuth({
        authType: collection.authType || 'No Auth',
        token: collection.authToken || '',
        username: collection.authUsername || '',
        password: collection.authPassword || '',
        apiKey: collection.apiKey || '',
        apiValue: collection.apiValue || ''
      });
    } else {
      setEditingCollectionId(null);
      setFolderNameInput("");
      setFolderAuth({ authType: 'No Auth', token: '', username: '', password: '', apiKey: '', apiValue: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveCollection = async () => {
    if (!folderNameInput.trim()) return;
    
    const collectionData = {
      name: folderNameInput,
      userId: userId,
      authType: folderAuth.authType,
      authToken: folderAuth.token,
      authUsername: folderAuth.username,
      authPassword: folderAuth.password,
      apiKey: folderAuth.apiKey,
      apiValue: folderAuth.apiValue
    };

    try {
      if (modalMode === "create") {
        await axios.post('/api/collections', collectionData);
      } else {
        await axios.patch(`/api/collections/${editingCollectionId}`, collectionData);
      }
      setIsModalOpen(false);
      fetchAllData(); 
    } catch (err) {
      alert("폴더 저장에 실패했습니다.");
    }
  };

  const handleDeleteCollection = async (e, collectionId) => {
    e.stopPropagation(); 
    if (!window.confirm("이 폴더를 삭제하시겠습니까? (폴더 안의 기록은 유지됩니다.)")) return;
    
    try {
      await axios.delete(`/api/collections/${collectionId}`);
      fetchAllData(); 
    } catch (err) {
      console.error("폴더 삭제 실패:", err);
      alert("폴더 삭제에 실패했습니다.");
    }
  };

  const handleRunCollectionTest = async (e, collectionId) => {
    e.stopPropagation(); 
    if (!window.confirm("이 폴더 안의 모든 API를 실행하시겠습니까?")) return;
    
    setLoading(true);
    try {
      const res = await axios.post(`/api/bulk-test/collection/${collectionId}`);
      const { successCount, failCount, details } = res.data;
      alert(`단체 테스트 완료!\n성공: ${successCount}건\n실패: ${failCount}건`);
      if (onBulkResults && details) {
        onBulkResults(details); 
      }
      fetchAllData(); 
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("단체 테스트 실패:", err);
      alert("테스트 중 서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // Sidebar.js 내의 handleMoveItem 함수 수정
  const handleMoveItem = async (item, targetCollectionId) => {
    try {
      // 1. 기존 데이터 유지를 위해 item 전체를 복사하고 필요한 부분만 수정/추가
      const refinedItem = {
        ...item, 
        url: item.apiUrl || item.url, // 필드명 호환성 유지
        collectionId: targetCollectionId,
        
        // ✅ [중요] 평탄화된 인증 필드들을 명시적으로 포함
        // DB에서 가져온 필드명(authUsername 등)과 DTO 필드명(username 등)을 매핑
        authType: item.authType ? item.authType.replace(/ /g, '_') : 'No_Auth',
        token: item.authorization || item.token || '',
        username: item.authUsername || item.username || '',
        password: item.authPassword || item.password || '',
        key: item.apiKey || item.key || '',
        value: item.apiValue || item.value || '',

        // JSON 필드 파싱 처리
        params: typeof item.params === 'string' ? JSON.parse(item.params || '[]') : (item.params || []),
        headers: typeof item.headers === 'string' ? JSON.parse(item.headers || '[]') : (item.headers || []),
        body: item.body || ''
      };

      console.log("🚀 폴더 이동 요청 데이터:", refinedItem);

      // 2. 백엔드 업데이트 호출
      await axios.put(`/api/history/${item.apiId}`, refinedItem);
      
      // 3. 상태 초기화 및 갱신
      setMovingItemId(null);
      fetchAllData();
      if (onRefresh) onRefresh();
      
      alert("폴더 이동 완료");
    } catch (err) {
      console.error("이동 실패 상세:", err);
      alert("폴더 이동 실패");
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
          <button onClick={() => openModal("create")} title="새 폴더 추가" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#4CAF50' }}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
          <button onClick={fetchAllData} className="icon-refresh-btn" title="새로고침" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
            <FontAwesomeIcon icon={faArrowRotateRight} spin={loading} />
          </button>
        </div>
      </div>

      {/* 통합 모달 */}
      {isModalOpen && (
        <div style={{ 
          position: 'absolute', top: '50px', left: '15px', right: '15px', 
          background: 'white', border: '1px solid #ddd', padding: '15px', 
          zIndex: 10, boxShadow: '0 4px 15px rgba(0,0,0,0.2)', borderRadius: '8px' 
        }}>
          <h4 style={{ margin: '0 0 15px 0' }}>{modalMode === "create" ? "새 폴더 추가" : "폴더 설정"}</h4>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '0.75em', color: '#666' }}>폴더 이름</label>
            <input 
              autoFocus style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              value={folderNameInput} 
              onChange={(e) => setFolderNameInput(e.target.value)}
              placeholder="이름 입력..."
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '0.75em', color: '#666' }}>기본 인증 (상속용)</label>
            <select 
              style={{ width: '100%', padding: '8px' }}
              value={folderAuth.authType}
              onChange={(e) => setFolderAuth({ ...folderAuth, authType: e.target.value })}
            >
              <option value="No Auth">No Auth</option>
              <option value="Bearer Token">Bearer Token</option>
              <option value="Basic Auth">Basic Auth</option>
              <option value="API Key">API Key</option>
            </select>
          </div>

          <div style={{ marginBottom: '10px', background: '#f9f9f9', padding: folderAuth.authType === 'No Auth' ? '0' : '10px', borderRadius: '4px' }}>
            {folderAuth.authType === 'Bearer Token' && (
              <input 
                placeholder="Token" style={{ width: '100%', padding: '8px' }}
                value={folderAuth.token}
                onChange={(e) => setFolderAuth({ ...folderAuth, token: e.target.value })}
              />
            )}
            {folderAuth.authType === 'Basic Auth' && (
              <>
                <input 
                  placeholder="Username" style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                  value={folderAuth.username}
                  onChange={(e) => setFolderAuth({ ...folderAuth, username: e.target.value })}
                />
                <input 
                  type="password" placeholder="Password" style={{ width: '100%', padding: '8px' }}
                  value={folderAuth.password}
                  onChange={(e) => setFolderAuth({ ...folderAuth, password: e.target.value })}
                />
              </>
            )}
            {folderAuth.authType === 'API Key' && (
              <>
                <input 
                  placeholder="Key" style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                  value={folderAuth.apiKey}
                  onChange={(e) => setFolderAuth({ ...folderAuth, apiKey: e.target.value })}
                />
                <input 
                  placeholder="Value" style={{ width: '100%', padding: '8px' }}
                  value={folderAuth.apiValue}
                  onChange={(e) => setFolderAuth({ ...folderAuth, apiValue: e.target.value })}
                />
              </>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '5px' }}>
            <button onClick={handleSaveCollection} style={{ padding: '6px 12px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              저장
            </button>
            <button onClick={() => setIsModalOpen(false)} style={{ padding: '6px 12px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              취소
            </button>
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

                <div className="item-actions" style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={(e) => handleRunCollectionTest(e, col.collectionId)} title="폴더 내 전체 실행" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4CAF50' }}>
                    <FontAwesomeIcon icon={faPlay} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); openModal("edit", col); }} title="폴더 수정" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2196F3' }}>
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </button>
                  <button onClick={(e) => handleDeleteCollection(e, col.collectionId)} title="폴더 삭제" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f44336' }}>
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