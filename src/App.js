import React, { useState, useEffect } from 'react';
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
  const [history, setHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [results, setResults] = useState([]);

  // ========================
  // 🔹 히스토리 불러오기
  // ========================
  const fetchHistory = async () => {
    try {
      // 👉 인터셉터 방식이므로 header 필요 없음
      const response = await axios.get('/api/history');
      setHistory(response.data);
    } catch (error) {
      console.error("히스토리 조회 실패:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // ========================
  // 🔹 히스토리 클릭 시
  // ========================
  const handleSelectHistory = (item) => {
    setSelectedHistory(item);
  };

  // ========================
  // 🔹 API 요청 실행
  // ========================
  const handleSendRequest = async (requestData) => {
    try {
      // 👉 인터셉터가 자동으로 토큰을 넣어줌
      const response = await axios.post('/api/test', requestData);

      const responseData = response.data;

      const newResult = {
        testcaseId: Date.now(),
        method: requestData.method,
        url: requestData.url,
        body: requestData.body,
        statusCode: responseData.statusCode || response.status,
        responseBody: responseData.body
      };

      setResults(prev => [...prev, newResult]);

      // DB 저장 후 히스토리 새로고침
      await fetchHistory();

    } catch (error) {
      console.error("API 요청 실패:", error);
      alert("API 요청 실패: " + (error.response?.data || error.message));
    }
  };

  // ========================
  // 🔹 값 수동 저장
  // ========================
  const handleSaveToHistory = async () => {
    try {
      await fetchHistory();
    } catch (error) {
      console.error("히스토리 저장 실패:", error);
    }
  };

  // ========================
  // 🔹 대량 요청 결과 반영
  // ========================
  const handleBulkResults = (bulkResults) => {
    setResults(prev => [...prev, ...bulkResults]);
    fetchHistory();
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
                  
                  {/* ---------- 사이드바 ---------- */}
                  <div
                    style={{
                      width: '20%',
                      borderRight: '1px solid #ccc',
                      padding: '10px',
                    }}
                  >
                    <Sidebar
                      history={history}
                      onSelectHistory={handleSelectHistory}
                      onRefresh={fetchHistory}
                    />
                  </div>

                  {/* ---------- 메인 영역 ---------- */}
                  <div style={{ width: '80%', padding: '20px' }}>
                    <SampleFileDownload />
                    <FileUploader onResultsReceived={handleBulkResults} />
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
