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
  const handleSendRequest = async (flattenedData) => {
    // 1. 전송용 데이터 복사 (원본 보존)
    let payload = { ...flattenedData };

    // 2. [상속 로직] 'Inherit_from_Parent'인 경우 폴더 정보 덮어쓰기
    if (payload.authType === 'Inherit_from_Parent') {
      // selectedHistory가 없더라도 payload에 collectionId가 있다면 그것을 우선 사용
      const targetCollectionId = payload.collectionId || selectedHistory?.collectionId;
      const parentFolder = collections.find(c => c.collectionId === targetCollectionId);

      if (parentFolder && parentFolder.authType && parentFolder.authType !== 'No Auth') {
        payload.authType = parentFolder.authType.replace(/ /g, '_');
        payload.token = parentFolder.authToken || '';
        payload.username = parentFolder.authUsername || '';
        payload.password = parentFolder.authPassword || '';
        payload.key = parentFolder.apiKey || '';
        payload.value = parentFolder.apiValue || '';
        console.log(`[상속 적용] '${parentFolder.name}' 폴더의 인증 정보를 사용합니다.`);
      } else {
        payload.authType = 'No_Auth';
        console.log("[상속 알림] 상속받을 폴더 정보가 없어 'No Auth'로 진행합니다.");
      }
    }

      try {
        // 3. 백엔드 전송 (이 API가 실행 결과와 함께 DB 저장을 수행함)
        const response = await axios.post('/api/test', payload);
        
        // 4. 결과 테이블 업데이트용 데이터 구성
        const newResult = {
          testcaseId: response.data.apiId || Date.now(), // 백엔드에서 생성된 ID 우선 사용
          method: payload.method,
          url: payload.url,
          statusCode: response.data.statusCode || response.status,
          responseBody: response.data.body
        };
        
        // 결과 리스트 상단에 추가
        setResults(prev => [newResult, ...prev]);

        // ✅ [중요] 실행 후 사이드바의 히스토리 목록을 즉시 새로고침
        fetchHistoryTrigger(); 
        
        console.log("🚀 실행 및 저장 완료:", response.data);
      } catch (error) {
        console.error("전송 에러:", error);
        alert("요청 실패: " + (error.response?.data?.message || error.message));
      }
    };

  // 신규 저장 및 갱신 공통
  const handleSaveToHistory = async (data) => {
    if (data) {
        try {
            await axios.post('/api/history/save', data);
            alert("저장되었습니다.");
        } catch (e) {
            console.error("저장 오류", e);
        }
    }
    fetchHistoryTrigger();
  };

  const handleBulkResults = (bulkData) => {
    const rawList = Array.isArray(bulkData) ? bulkData : (bulkData.results || bulkData.details || []);
    if (rawList.length === 0) return;

    const mappedResults = rawList.map((item, index) => ({
      testcaseId: item.apiId || item.testcaseId || `bulk-${Date.now()}-${index}`,
      method: item.method || 'GET',
      url: item.apiUrl || item.url || 'N/A',
      statusCode: item.statusCode || item.status || 0,
      responseBody: item.responseBody || item.response || item.body || '응답 본문 없음'
    }));

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