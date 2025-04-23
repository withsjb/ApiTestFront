import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar/Sidebar';
import ApiTester from './components/ApiTester/ApiTester';
import ResultTable from './components/ResultTable/ResultTable';
import SampleFileDownload from "./components/FileReadDownload/SampleFileDownload"; // SampleFileDownload 컴포넌트 가져오기
import FileUploader from "./components/FileReadDownload//FileUploader"; // 파일 업로드 기능을 위한 컴포넌트 추가
import Header from './components/Header/Header';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import {BrowserRouter, Routes, Route} from 'react-router-dom'

function App() {
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [results, setResults] = useState([]); // ResultTable에 표시할 결과 저장


  // 반드시 내 백엔드로만 요청!
  const handleSendRequest = async (requestData) => {
    try {
      // Authorization 헤더 추가
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // 내 백엔드 /api/test로 요청
      const response = await axios.post('/api/test', requestData, { headers });

      // 백엔드 응답 구조에 맞게 데이터 추출
      const responseData = response.data;
      
      setResults(prevResults => [
        ...prevResults,
        {
          testcaseId: Date.now(),
          method: requestData.method,
          url: requestData.url,
          body: requestData.body,
          statusCode: responseData.statusCode || response.status,
          responseBody: responseData.body
        }
      ]);
    } catch (error) {
      console.error("API 요청 실패:", error);
      alert("API 요청 실패: " + (error.response?.data || error.message));
    }
  };
  
  // 대량 API 테스트 결과 처리 함수 - CSV 파일 업로드 후 받은 결과 처리
  const handleBulkResults = (bulkResults) => {
    setResults((prevResults) => [...prevResults, ...bulkResults]); // 기존 데이터와 병합
  };

  return (
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
                  <Sidebar onSelectHistory={setSelectedHistory} />
                </div>
  
                {/* 메인 콘텐츠 */}
                <div style={{ width: '80%', padding: '20px' }}>
                  <SampleFileDownload />
                  <FileUploader onResultsReceived={handleBulkResults} />
                  <ApiTester
                    selectedHistory={selectedHistory}
                    onSendRequest={handleSendRequest}
                  />
                  <ResultTable results={results} />
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
  
}

export default App;