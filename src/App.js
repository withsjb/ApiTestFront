import React, { useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import ApiTester from './components/ApiTester/ApiTester';
import ResultTable from './components/ResultTable/ResultTable';

function App() {
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [results, setResults] = useState([]); // ResultTable에 표시할 결과 저장

  const handleSendRequest = (result) => {
    setResults([...results, result]); // 요청 결과를 테이블에 추가
  };

  return (
    <div className="App" style={{ display: 'flex' }}>
      {/* 사이드바 */}
      <div style={{ width: '20%', borderRight: '1px solid #ccc', padding: '10px' }}>
        <Sidebar onSelectHistory={setSelectedHistory} />
      </div>

      {/* 메인 콘텐츠 */}
      <div style={{ width: '80%', padding: '20px' }}>
        <ApiTester selectedHistory={selectedHistory} onSendRequest={handleSendRequest} />
        <ResultTable results={results} />
      </div>
    </div>
  );
}

export default App;
