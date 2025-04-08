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

  // 단일 API 요청 처리 함수 - 실제 API 엔드포인트로 요청 전송
  const handleSendRequest = async (result) => {
    try {
      const response = await axios.post("http://localhost:8081/api/test", result); // 실제 API 요청 전송
      setResults([...results, { ...result, statusCode: response.status }]); // 응답 상태 코드 추가
    } catch (error) {
      console.error("API 요청 실패:", error);
    }
  };
  
  // 대량 API 테스트 결과 처리 함수 - CSV 파일 업로드 후 받은 결과 처리
  const handleBulkResults = (bulkResults) => {
    setResults(prev => [...prev, ...bulkResults]); // 대량 테스트 결과를 테이블에 추가
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