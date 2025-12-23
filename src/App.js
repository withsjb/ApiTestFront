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

  // 사이드바 목록 갱신 트리거
  const fetchHistoryTrigger = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSelectHistory = (item) => {
    setSelectedHistory(item);
  };

  // API 실행
  const handleSendRequest = async (formData) => {
    try {
      const response = await axios.post('/api/test', formData);
      const newResult = {
        testcaseId: Date.now(),
        method: formData.method,
        url: formData.url,
        statusCode: response.data.statusCode || response.status,
        responseBody: response.data.body
      };
      setResults(prev => [newResult, ...prev]);
      fetchHistoryTrigger();
    } catch (error) {
      alert("요청 실패: " + (error.response?.data || error.message));
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
  // 1. 데이터 추출 (배열인지 객체인지 확인)
  // res.data 자체가 배열일 수도 있고, { results: [] } 형태일 수도 있음
  const rawList = Array.isArray(bulkData) ? bulkData : (bulkData.results || bulkData.details || []);

  if (rawList.length === 0) {
    console.warn("표시할 결과 데이터가 없습니다.");
    return;
  }

  // 2. ResultTable.js의 필드명 규격에 맞게 매핑
  const mappedResults = rawList.map((item, index) => ({
    // ResultTable이 기대하는 key: 데이터에서 가져올 값 (없으면 대체값)
    testcaseId: item.apiId || item.testcaseId || `bulk-${Date.now()}-${index}`,
    method: item.method || 'GET',
    url: item.apiUrl || item.url || 'N/A', // 👈 Sidebar는 apiUrl, CSV는 url일 수 있음
    statusCode: item.statusCode || item.status || 0,
    responseBody: item.responseBody || item.response || item.body || '응답 본문 없음' // 👈 필드명 불일치 해결
  }));

  // 3. 상태 업데이트 (최신 결과가 맨 위로)
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
                  <div style={{ width: '20%', borderRight: '1px solid #ccc', padding: '10px' }}>
                    <Sidebar
                      onSelectHistory={handleSelectHistory}
                      onRefresh={fetchHistoryTrigger}
                      refreshTrigger={refreshTrigger}
                      onBulkResults={handleBulkResults}
                    />
                  </div>

                  <div style={{ width: '80%', padding: '20px' }}>
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