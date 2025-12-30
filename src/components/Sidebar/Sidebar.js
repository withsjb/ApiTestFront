import React, { useEffect, useState, useCallback } from "react";
import axios from '../../api/axiosInstance';
import './Sidebar.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPenToSquare, faTrashCan, faArrowRotateRight, 
  faFolder, faFolderOpen, faChevronRight, faChevronDown, faPlus, faShareFromSquare,
  faPlay, faClockRotateLeft 
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ collections, setCollections, onSelectHistory, onRefresh, 
  refreshTrigger, onBulkResults }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openCollections, setOpenCollections] = useState({});
  const [openHistory, setOpenHistory] = useState({}); // 🔥 히스토리(자식) 펼침 상태 추가
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); 
  const [folderNameInput, setFolderNameInput] = useState("");
  const [editingCollectionId, setEditingCollectionId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]); // 선택된 ID들 관리

  const [folderAuth, setFolderAuth] = useState({
    authType: 'No Auth', token: '', username: '', password: '', apiKey: '', apiValue: ''
  });
  
  const [movingItemId, setMovingItemId] = useState(null); 
  const userId = 1; 

  // ✅ 데이터 조회 및 부모-자식 구조화 (Backend parent_id 활용)
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [colRes, histRes] = await Promise.all([
        axios.get(`/api/collections?userId=${userId}`),
        axios.get('/api/history')
      ]);

      setCollections(colRes.data);
      
      const rawData = histRes.data;
      // 1. 부모(설계도, parentId가 null)와 자식(실행로그, parentId가 존재) 분리
      const parents = rawData.filter(item => item.parentId === null);
      const children = rawData.filter(item => item.parentId !== null);

      // 2. 부모 객체에 자식들을 매핑
      const structuredData = parents.map((parent, index) => ({
        ...parent,
        safeKey: parent.apiId ?? `parent-${index}`,
        historyLogs: children
          .filter(child => child.parentId === parent.apiId)
          .sort((a, b) => (b.apiId || 0) - (a.apiId || 0)) // 최신순 정렬
      }));

      setHistory(structuredData);
    } catch (err) {
      console.error('데이터를 불러올 수 없습니다.', err);
    } finally {
      setLoading(false);
    }
  }, [setCollections]);
  
  useEffect(() => {
    fetchAllData();
  }, [refreshTrigger, fetchAllData]);

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
      name: folderNameInput, userId: userId,
      authType: folderAuth.authType, authToken: folderAuth.token,
      authUsername: folderAuth.username, authPassword: folderAuth.password,
      apiKey: folderAuth.apiKey, apiValue: folderAuth.apiValue
    };
    try {
      if (modalMode === "create") await axios.post('/api/collections', collectionData);
      else await axios.patch(`/api/collections/${editingCollectionId}`, collectionData);
      setIsModalOpen(false);
      fetchAllData(); 
    } catch (err) { alert("폴더 저장에 실패했습니다."); }
  };

  const handleDeleteCollection = async (e, collectionId) => {
    e.stopPropagation(); 
    if (!window.confirm("이 폴더를 삭제하시겠습니까? (폴더 안의 기록은 유지됩니다.)")) return;
    try {
      await axios.delete(`/api/collections/${collectionId}`);
      fetchAllData(); 
    } catch (err) { alert("폴더 삭제에 실패했습니다."); }
  };

  const handleRunCollectionTest = async (e, collectionId) => {
    e.stopPropagation(); 
    if (!window.confirm("이 폴더 안의 모든 API를 실행하시겠습니까?")) return;
    setLoading(true);
    try {
      const res = await axios.post(`/api/bulk-test/collection/${collectionId}`);
      if (onBulkResults) onBulkResults(res.data); 
      fetchAllData(); 
      if (onRefresh) onRefresh();
    } catch (err) { alert("단체 테스트 실패"); }
    finally { setLoading(false); }
  };

  const handleMoveItem = async (item, targetCollectionId) => {
    try {
      const refinedItem = {
        ...item, 
        url: item.apiUrl || item.url,
        collectionId: targetCollectionId,
        authType: item.authType ? item.authType.replace(/ /g, '_') : 'No_Auth',
        token: item.authorization || item.token || '',
        username: item.authUsername || item.username || '',
        password: item.authPassword || item.password || '',
        key: item.apiKey || item.key || '',
        value: item.apiValue || item.value || '',
        tokenUrl: item.authTokenUrl || '',
        grantType: item.grantType || '',
        scope: item.authScope || '',
        clientId: item.clientId || '',
        clientSecret: item.clientSecret || '',
        clientAuthMethod: item.clientAuthMethod || 'header',
        awsAccessKey: item.awsAccessKey || '',
        awsSecretKey: item.awsSecretKey || '',
        awsRegion: item.awsRegion || '',
        awsService: item.awsService || '',
        awsSessionToken: item.awsSessionToken || '',
        params: typeof item.params === 'string' ? JSON.parse(item.params || '[]') : (item.params || []),
        headers: typeof item.headers === 'string' ? JSON.parse(item.headers || '[]') : (item.headers || []),
        body: item.body || ''
      };
      await axios.put(`/api/history/${item.apiId}`, refinedItem);
      setMovingItemId(null);
      fetchAllData();
      if (onRefresh) onRefresh();
      alert("폴더 이동 완료");
    } catch (err) { alert("폴더 이동 실패"); }
  };

  const toggleCollection = (e, id) => {
    e.stopPropagation();
    setOpenCollections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // ✅ 화살표 토글 함수
  const toggleHistory = (e, apiId) => {
    e.stopPropagation();
    setOpenHistory(prev => ({ ...prev, [apiId]: !prev[apiId] }));
  };

  const handleDelete = async (e, apiId) => {
    e.stopPropagation();
    if (!window.confirm("이 기록을 삭제하시겠습니까? 하위 실행 이력도 모두 삭제됩니다.")) return;
    try {
      await axios.delete(`/api/history/${apiId}`);
      fetchAllData();
      if (onRefresh) onRefresh();
    } catch (err) { alert("삭제 실패"); }
  };

  const handleCheck = (e, apiId) => {
    e.stopPropagation(); // 아이템 클릭 이벤트 전파 방지
    if (e.target.checked) {
      setSelectedIds(prev => [...prev, apiId]);
    } else {
      setSelectedIds(prev => prev.filter(id => id !== apiId));
    }
  };

  const handleDeleteChecked = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`선택한 ${selectedIds.length}개의 항목을 삭제하시겠습니까?`)) return;

    try {
      // 💡 백엔드의 새로운 엔드포인트 호출
      await axios.post('/api/history/check-api-delete', selectedIds);
      
      alert("삭제가 완료되었습니다.");
      setSelectedIds([]); // 체크박스 초기화
      fetchAllData();     // 목록 새로고침
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("일괄 삭제 실패:", err);
      alert("삭제 처리 중 오류가 발생했습니다.");
    }
  };

  // ✅ 계층 구조 렌더링 함수
  const renderHierarchicalItem = (item) => (
    <li key={item.safeKey} style={{ borderBottom: '1px solid #f0f0f0', listStyle: 'none' }}>
      <div 
        className="history-item"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '8px 10px' }}
        onClick={() => onSelectHistory(item)}
      >
        {/* ✅ 체크박스 추가 */}
      <input 
        type="checkbox" 
        style={{ marginRight: '10px', width: '14px', height: '14px', cursor: 'pointer' }}
        checked={selectedIds.includes(item.apiId)}
        onChange={(e) => handleCheck(e, item.apiId)}
      />
        <div style={{ flex: 1, overflow: 'hidden', marginRight: '5px', display: 'flex', alignItems: 'center' }}>
          {/* ✅ 하위 로그가 있을 때만 화살표 표시 */}
          <span onClick={(e) => toggleHistory(e, item.apiId)} style={{ marginRight: '8px', width: '12px', display: 'inline-block' }}>
            {item.historyLogs?.length > 0 && (
              <FontAwesomeIcon icon={openHistory[item.apiId] ? faChevronDown : faChevronRight} style={{ fontSize: '0.7em', color: '#888' }} />
            )}
          </span>
          <strong className={`method-${item.method}`} style={{ fontSize: '0.8em', minWidth: '40px' }}>{item.method}</strong>
          <span style={{ marginLeft: '5px', fontSize: '0.8em', color: '#333', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.apiUrl}
          </span>
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

      {/* ✅ 자식 히스토리 로그 렌더링 */}
      {openHistory[item.apiId] && item.historyLogs?.length > 0 && (
        <ul style={{ background: '#fafafa', padding: '0 0 5px 35px', margin: 0, borderLeft: '2px solid #ddd' }}>
          {item.historyLogs.map(log => (
            <li 
              key={log.apiId} 
              className="history-log-subitem"
              onClick={() => onSelectHistory(log)}
              style={{ padding: '6px 10px', fontSize: '0.75em', cursor: 'pointer', display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee' }}
            >
              <FontAwesomeIcon icon={faClockRotateLeft} style={{ marginRight: '8px', color: '#999', fontSize: '0.8em' }} />
              <span style={{ color: log.statusCode >= 400 ? '#f44336' : '#4CAF50', fontWeight: 'bold', marginRight: '8px', minWidth: '30px' }}>
                {log.statusCode}
              </span>
              <span style={{ color: '#666' }}>Response Log ({new Date(log.apiId).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})</span>
            </li>
          ))}
        </ul>
      )}

      {movingItemId === item.apiId && (
        <div style={{ padding: '8px', background: '#f9f9f9', borderTop: '1px dashed #ddd' }}>
          <div style={{ fontSize: '0.7em', color: '#888', marginBottom: '5px' }}>폴더 선택:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            <button onClick={() => handleMoveItem(item, null)} style={{ fontSize: '0.7em', padding: '2px 5px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '3px' }}>미분류</button>
            {collections.map(col => (
              <button key={col.collectionId} onClick={() => handleMoveItem(item, col.collectionId)} style={{ fontSize: '0.7em', padding: '2px 5px', cursor: 'pointer', border: '1px solid #4CAF50', borderRadius: '3px', color: '#4CAF50' }}>{col.name}</button>
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
          {selectedIds.length > 0 && (
              <div style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                padding: '8px 10px', background: '#fff4f4', borderRadius: '4px', marginBottom: '10px' 
              }}>
                <span style={{ fontSize: '0.5em', color: '#f44336', fontWeight: 'bold' }}>
                  {selectedIds.length}개 선택됨
                </span>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button onClick={() => setSelectedIds([])} style={{ fontSize: '0.7em', border: 'none', background: '#ddd', padding: '3px 7px', cursor: 'pointer', borderRadius: '3px' }}>취소</button>
                  <button onClick={handleDeleteChecked} style={{ fontSize: '0.7em', border: 'none', background: '#f44336', color: 'white', padding: '3px 7px', cursor: 'pointer', borderRadius: '3px' }}>삭제 실행</button>
                </div>
              </div>
            )}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => openModal("create")} title="새 폴더 추가" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#4CAF50' }}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
          <button onClick={fetchAllData} className="icon-refresh-btn" title="새로고침" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
            <FontAwesomeIcon icon={faArrowRotateRight} spin={loading} />
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div style={{ 
          position: 'absolute', top: '50px', left: '15px', right: '15px', 
          background: 'white', border: '1px solid #ddd', padding: '15px', 
          zIndex: 10, boxShadow: '0 4px 15px rgba(0,0,0,0.2)', borderRadius: '8px' 
        }}>
          <h4 style={{ margin: '0 0 15px 0' }}>{modalMode === "create" ? "새 폴더 추가" : "폴더 설정"}</h4>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '0.75em', color: '#666' }}>폴더 이름</label>
            <input autoFocus style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} value={folderNameInput} onChange={(e) => setFolderNameInput(e.target.value)} placeholder="이름 입력..."/>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '0.75em', color: '#666' }}>기본 인증 (상속용)</label>
            <select style={{ width: '100%', padding: '8px' }} value={folderAuth.authType} onChange={(e) => setFolderAuth({ ...folderAuth, authType: e.target.value })}>
              <option value="No Auth">No Auth</option>
              <option value="Bearer Token">Bearer Token</option>
              <option value="Basic Auth">Basic Auth</option>
              <option value="API Key">API Key</option>
            </select>
          </div>
          <div style={{ marginBottom: '10px', background: '#f9f9f9', padding: folderAuth.authType === 'No Auth' ? '0' : '10px', borderRadius: '4px' }}>
            {folderAuth.authType === 'Bearer Token' && (
              <input placeholder="Token" style={{ width: '100%', padding: '8px' }} value={folderAuth.token} onChange={(e) => setFolderAuth({ ...folderAuth, token: e.target.value })}/>
            )}
            {folderAuth.authType === 'Basic Auth' && (
              <><input placeholder="Username" style={{ width: '100%', padding: '8px', marginBottom: '5px' }} value={folderAuth.username} onChange={(e) => setFolderAuth({ ...folderAuth, username: e.target.value })}/><input type="password" placeholder="Password" style={{ width: '100%', padding: '8px' }} value={folderAuth.password} onChange={(e) => setFolderAuth({ ...folderAuth, password: e.target.value })}/></>
            )}
            {folderAuth.authType === 'API Key' && (
              <><input placeholder="Key" style={{ width: '100%', padding: '8px', marginBottom: '5px' }} value={folderAuth.apiKey} onChange={(e) => setFolderAuth({ ...folderAuth, apiKey: e.target.value })}/><input placeholder="Value" style={{ width: '100%', padding: '8px' }} value={folderAuth.apiValue} onChange={(e) => setFolderAuth({ ...folderAuth, apiValue: e.target.value })}/></>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '5px' }}>
            <button onClick={handleSaveCollection} style={{ padding: '6px 12px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>저장</button>
            <button onClick={() => setIsModalOpen(false)} style={{ padding: '6px 12px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>취소</button>
          </div>
        </div>
      )}

      {/* COLLECTIONS 섹션 */}
      <div className="sidebar-section">
        <h4 style={{ color: '#888', fontSize: '0.8em', marginBottom: '10px' }}>COLLECTIONS</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {collections.map(col => (
            <li key={col.collectionId} style={{ marginBottom: '5px' }}>
              <div onClick={(e) => toggleCollection(e, col.collectionId)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '8px 10px', borderRadius: '4px', background: '#f8f9fa' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FontAwesomeIcon icon={openCollections[col.collectionId] ? faChevronDown : faChevronRight} style={{ fontSize: '0.7em', marginRight: '8px', color: '#aaa' }} />
                  <FontAwesomeIcon icon={openCollections[col.collectionId] ? faFolderOpen : faFolder} style={{ marginRight: '8px', color: '#ffca28' }} />
                  <span style={{ fontSize: '0.9em', fontWeight: 'bold' }}>{col.name}</span>
                </div>
                <div className="item-actions" style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={(e) => handleRunCollectionTest(e, col.collectionId)} title="전체 실행" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4CAF50' }}><FontAwesomeIcon icon={faPlay} /></button>
                  <button onClick={(e) => { e.stopPropagation(); openModal("edit", col); }} title="수정" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2196F3' }}><FontAwesomeIcon icon={faPenToSquare} /></button>
                  <button onClick={(e) => handleDeleteCollection(e, col.collectionId)} title="삭제" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f44336' }}><FontAwesomeIcon icon={faTrashCan} /></button>
                </div>
              </div>
              {openCollections[col.collectionId] && (
                <ul style={{ listStyle: 'none', paddingLeft: '15px', marginTop: '5px' }}>
                  {history.filter(h => h.collectionId === col.collectionId).length > 0 ? (
                    history.filter(h => h.collectionId === col.collectionId).map(item => renderHierarchicalItem(item))
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

      {/* UNCLASSIFIED 섹션 */}
      <div className="sidebar-section">
        <h4 style={{ color: '#888', fontSize: '0.8em', marginBottom: '10px' }}>UNCLASSIFIED</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {history
            .filter(h => h.collectionId === null)
            .map(item => renderHierarchicalItem(item))}
        </ul>
      </div>
      <div className="sidebar-section">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <FontAwesomeIcon icon={faClockRotateLeft} style={{ color: '#888', fontSize: '0.8em', marginRight: '5px' }} />
            <h4 style={{ color: '#888', fontSize: '0.8em', margin: 0 }}>RECENT ACTIVITY</h4>
          </div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {history.length > 0 ? (
              [...history]
                .sort((a, b) => (b.apiId || 0) - (a.apiId || 0)) // 최신순 정렬
                .slice(0, 15) // 최근 15개만 표시
                .map(item => renderHierarchicalItem(item))
            ) : (
              <li style={{ padding: '10px', fontSize: '0.8em', color: '#ccc', textAlign: 'center' }}>최근 활동 없음</li>
            )}
          </ul>
        </div>
        
        {/* 하단 여백 확보 */}
        <div style={{ height: '50px' }}></div>
    </div>
  );
};

export default Sidebar;