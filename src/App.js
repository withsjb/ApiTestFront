import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';

function App() {
  const [inputs, setInputs] = useState([]);
  const addInput = () => {
    setInputs([...inputs, { key: '', value: '', description: '' }]); // 새로운 input을 추가
  };

  const handleInputChange = (index, field, value) => {
    const updatedInputs = [...inputs];
    updatedInputs[index][field] = value; // 변경된 input의 값을 업데이트
    setInputs(updatedInputs);
  };
  return (
    <div className="App">
      <header className="App-header">
        <div className="sidebar">
            sidebar 1<br></br>
            sidebar 2
        </div>

        <div className="apiroom">
        <div>
          <select>
            <option>Get</option>

            <option>Post</option>

            <option>Put</option>

            <option>Delete</option>
          </select>
          <input className="inputurl" placeholder='url을 입력해주세요'></input>
          <button><a>send</a></button>
        </div>
        <div className="inputdataroom">
        <div className="paramsroom">
            <h1>Params</h1>
            <input placeholder='Key'></input>
            <input placeholder='Value'></input>
            <input placeholder='Description'></input>
          </div>
          <div className="Authroom">
            <h1>Authorization</h1>
            <input placeholder='Auth Type'></input>
            
          </div>
          <div className="Headers">
      <h1>Headers</h1>
      {inputs.map((input, index) => (
        <div key={index}>
          <input
            placeholder="Key"
            value={input.key}
            onChange={(e) => handleInputChange(index, 'key', e.target.value)}
          />
          <input
            placeholder="Value"
            value={input.value}
            onChange={(e) => handleInputChange(index, 'value', e.target.value)}
          />
          <input
            placeholder="Description"
            value={input.description}
            onChange={(e) => handleInputChange(index, 'description', e.target.value)}
          />
        </div>
      ))}
      <button onClick={addInput}>+</button> {/* + 버튼 클릭 시 input 추가 */}
    </div>
    <div className="Bodyroom">
            <h1>Body</h1>
            <textarea placeholder='body'></textarea>
            
          </div>
          </div>
        <a>  
          <br></br>
        ↓
        <br></br>
        </a>
        <div className="reponsediv">
          
        </div>
        <div className="result">
        <h1>결과 테이블</h1>
  <table>
    <thead>
      <tr>
        <th>testcaseID</th>
        <th>요약</th>
        <th>API Endpoint</th>
        <th>사용된 메소드</th>
        <th>걸린 시간</th>
        <th>응답 코드</th>
        <th>성공 여부</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data 1</td>
        <td>Data 2</td>
        <td>Data 1</td>
        <td>Data 2</td>
        <td>Data 1</td>
        <td>Data 2</td>
        <td>Data 1</td>
      </tr>
      <tr>
        <td>Data 1</td>
        <td>Data 2</td>
        <td>Data 1</td>
        <td>Data 2</td>
        <td>Data 1</td>
        <td>Data 2</td>
        <td>Data 1</td>
      </tr>
    </tbody>
  </table>
</div>
        </div>
        
      </header>
    </div>
  );
}

export default App;
