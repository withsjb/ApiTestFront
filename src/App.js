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
  // ✅ 히스토리 목록 상태
  const [history, setHistory] = useState([]);
  // ✅ 선택된 히스토리 항목 상태
  const [selectedHistory, setSelectedHistory] = useState(null);
  // ✅ API 테스트 결과 상태
  const [results, setResults] = useState([]);

  // ✅ 히스토리 불러오기 함수 (백엔드에서 현재 로그인 유저의 히스토리만 가져옴)
  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/history');
      setHistory(response.data);
    } catch (error) {
      console.error("히스토리 조회 실패:", error);
    }
  };

  // ✅ 컴포넌트 마운트 시 히스토리 로드 (최초 1회)
  useEffect(() => {
    fetchHistory();
  }, []);

  // ✅ 히스토리 항목 클릭(선택) 시 처리 함수
  const handleSelectHistory = (item) => {
    setSelectedHistory(item);
    // 선택된 히스토리 데이터를 ApiTester 입력폼에 채울 수 있음
  };

  // ✅ 단일 API 요청 처리 함수
  const handleSendRequest = async (requestData) => {
    try {
      // Authorization 헤더 추가 (로그인 토큰)
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // 내 백엔드 /api/test로 요청
      const response = await axios.post('/api/test', requestData, { headers });

      // 백엔드 응답 구조에 맞게 데이터 추출
      const responseData = response.data;
      
      const newResult = {
        testcaseId: Date.now(),
        method: requestData.method,
        url: requestData.url,
        body: requestData.body,
        statusCode: responseData.statusCode || response.status,
        responseBody: responseData.body
      };
      
      setResults(prevResults => [...prevResults, newResult]);
      
      // 요청이 DB에 저장되면 히스토리 새로고침
      await fetchHistory();
    } catch (error) {
      console.error("API 요청 실패:", error);
      alert("API 요청 실패: " + (error.response?.data || error.message));
    }
  };

  // ✅ 값 저장하기 버튼에서 호출할 함수 (명시적으로 저장 요청)
  const handleSaveToHistory = async (result) => {
    try {
      // 필요하다면 별도의 저장 API 호출 가능
      // await axios.post('/api/save-history', result);
      // 히스토리 새로고침
      await fetchHistory();
    } catch (error) {
      console.error("히스토리 저장 실패:", error);
    }
  };

  // ✅ 대량 API 테스트 결과 처리 함수
  const handleBulkResults = (bulkResults) => {
    setResults(prevResults => [...prevResults, ...bulkResults]);
    // 대량 테스트 후 히스토리 새로고침
    fetchHistory();
  };

  return (
    <AuthProvider>
      {
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
                    {/* 사이드바 */}
                    <div
                      style={{
                        width: '20%',
                        borderRight: '1px solid #ccc',
                        padding: '10px',
                      }}
                    >
                      {/* ✅ 히스토리 목록과 선택 함수 모두 props로 전달 */}
                      <Sidebar 
                        history={history} 
                        onSelectHistory={handleSelectHistory} 
                        onRefresh={fetchHistory} // (선택) 새로고침 버튼용
                      />
                    </div>
      
                    {/* 메인 콘텐츠 */}
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
      }
    </AuthProvider>
  );  
    
}

export default App;
