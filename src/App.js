import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import axios from './api/axiosInstance';
import Sidebar from './components/Sidebar/Sidebar';
import ApiTester from './components/ApiTester/ApiTester';
import ResultTable from './components/ResultTable/ResultTable';
import SampleFileDownload from "./components/FileReadDownload/SampleFileDownload";
import FileUploader from "./components/FileReadDownload/FileUploader";
import Header from './components/Header/Header';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [results, setResults] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [collections, setCollections] = useState([]);

  const fetchHistoryTrigger = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSelectHistory = (item) => {
    setSelectedHistory(item);
  };

  // ✅ API 실행 (평탄화된 데이터 구조 수용)
  // App.js 내 handleSendRequest 수정

  const handleSendRequest = async (flattenedData) => {
    // 1. 디버깅용 로그 추가 (어떤 데이터가 넘어오는지 확인)
    console.log("받은 데이터(flattenedData):", flattenedData);
    console.log("현재 선택된 기록(selectedHistory):", selectedHistory);

    // 2. Payload 구성 - apiId를 최우선으로 확보
    // flattenedData에 apiId가 없더라도 selectedHistory에 있다면 그것을 사용합니다.
    const apiId = selectedHistory?.apiId || flattenedData?.apiId || null;
    const parentId = flattenedData?.parentId || selectedHistory?.apiId || null; // ✅ 추가
    let payload = { 
      ...flattenedData,
      apiId: apiId, 
      parentId: parentId
    };

    // 3. 상속 로직 (기존 유지)
    if (payload.authType === 'Inherit_from_Parent') {
      const targetCollectionId = payload.collectionId || selectedHistory?.collectionId;
      const parentFolder = collections.find(c => c.collectionId === targetCollectionId);

      if (parentFolder && parentFolder.authType && parentFolder.authType !== 'No Auth') {
        payload.authType = parentFolder.authType.replace(/ /g, '_');
        payload.token = parentFolder.authToken || '';
        payload.username = parentFolder.authUsername || '';
        payload.password = parentFolder.authPassword || '';
        payload.key = parentFolder.apiKey || '';
        payload.value = parentFolder.apiValue || '';
      } else {
        payload.authType = 'No_Auth';
      }
    }

    // 🚀 최종 Payload 확인 (콘솔에 이 객체가 제대로 찍혀야 합니다)
    console.log("최종 전송 Payload:", payload);

    try {
      const response = await axios.post('/api/test', payload);
      
      const newResult = {
        testcaseId: response.data.apiId || Date.now(),
        method: payload.method,
        url: payload.url,
        statusCode: response.data.statusCode || response.status,
        responseBody: response.data.body
      };
      
      setResults(prev => [newResult, ...prev]);
      fetchHistoryTrigger(); 
      
    } catch (error) {
      console.error("전송 에러:", error);
      alert("요청 실패: " + (error.response?.data?.message || error.message));
    }
  };

  // 신규 저장 및 갱신 공통
  const handleSaveToHistory = async (data) => {
  if (data) {
    try {
      // 서버에서 저장된 엔티티(apiId 포함)를 반환한다고 가정
      const response = await axios.post('/api/history/save', data);
      alert("새로운 기록이 UNCLASSIFIED에 저장되었습니다.");
      
      // 필요하다면: 방금 저장한 기록을 편집 모드로 바로 전환
      setSelectedHistory(response.data); 
    } catch (e) {
      console.error("저장 오류", e);
    }
  }
  fetchHistoryTrigger(); // 목록 갱신 (Sidebar 업데이트)
};

  const handleBulkResults = (bulkData) => {
      // 1. 디버깅용 콘솔
      console.log("전달받은 벌크 데이터:", bulkData);

      // 2. 결과 리스트 추출 (백엔드에서 보내주는 'details' 필드 사용)
      const rawList = bulkData.details || (Array.isArray(bulkData) ? bulkData : []);
      
      // 데이터가 없는지 체크하는 로직 수정
      if (rawList.length === 0) {
          console.warn("표시할 결과 데이터(details)가 없습니다.");
          return;
      }

      // 3. 팝업 알림 (백엔드 필드명 successCount, failureCount에 맞춤)
      const success = bulkData.successCount !== undefined ? bulkData.successCount : 0;
      const fail = bulkData.failureCount !== undefined ? bulkData.failureCount : 0;
      
      alert(`단체 테스트 완료!\n성공: ${success}건\n실패: ${fail}건`);

      // 4. 테이블 매핑
      const mappedResults = rawList.map((item, index) => ({
        testcaseId: item.apiId || item.testcaseId || `bulk-${Date.now()}-${index}`,
        method: item.method || 'GET',
        url: item.apiUrl || item.url || 'N/A',
        statusCode: item.statusCode || item.status || 0,
        // 백엔드 엔티티 필드명이 responsebody(소문자)인지 확인하며 매핑
        responseBody: item.responsebody || item.responseBody || item.body || '응답 본문 없음'
      }));

      // 5. 상태 업데이트
      setResults(prev => [...mappedResults, ...prev]);
      fetchHistoryTrigger();
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <div className="App" style={{ display: 'flex' }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/"
              element={
                <div style={{ display: 'flex', width: '100%' }}>
                  <div style={{ width: '25%', borderRight: '1px solid #ccc', padding: '10px', minHeight: '100vh' }}>
                    <Sidebar
                      collections={collections}
                      setCollections={setCollections}
                      onSelectHistory={handleSelectHistory}
                      onRefresh={fetchHistoryTrigger}
                      refreshTrigger={refreshTrigger}
                      onBulkResults={handleBulkResults}
                    />
                  </div>

                  <div style={{ width: '75%', padding: '20px' }}>
                    <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
                        <SampleFileDownload />
                        <FileUploader onResultsReceived={handleBulkResults} />
                    </div>
                    <ApiTester
                      selectedHistory={selectedHistory}
                      onSendRequest={handleSendRequest}
                      onSaveToHistory={handleSaveToHistory}
                      onSelectHistory={setSelectedHistory}
                    />
                    <ResultTable results={results} />
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;