import React from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import ApiTester from './components/ApiTester/ApiTester';
import ResultTable from './components/ResultTable/ResultTable';

function App() {
  return (
    <div className="App">
      {/* 사이드바 */}
      <div className="sidebar">
        <Sidebar />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="main-content">
        <ApiTester />
        <ResultTable results={[]} />
      </div>
    </div>
  );
}

export default App;
