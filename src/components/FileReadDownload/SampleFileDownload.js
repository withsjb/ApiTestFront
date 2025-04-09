import React from "react";

const SampleFileDownload = () => {
  // ✅ 로컬 스토리지에서 로그인한 사용자 ID 가져오기
  const loggedInUserId = localStorage.getItem("userId") || "1"; // 기본값은 "1"

  // ✅ 샘플 CSV 데이터 (로그인한 사용자 ID 적용)
  const csvData = [
    ["method", "url", "authType", "token", "params", "headers", "body"],
    [
      "POST",
      "https://example.com/api",
      "Bearer Token",
      "example-token",
      `[{"key":"userId","value":"${loggedInUserId}"},{"key":"active","value":"true"}]`,
      '[{"key":"Content-Type","value":"application/json"},{"key":"Authorization","value":"Bearer example-token"}]',
      '{"name":"John Doe","email":"john.doe@example.com"}',
    ],
    [
      "GET",
      "https://example.com/api",
      "Bearer Token",
      "example-token",
      `[{"key":"userId","value":"${loggedInUserId}"}]`,
      '[{"key":"Content-Type","value":"application/json"}]',
      "",
    ],
  ];

  // CSV 파일 생성 및 다운로드
  const downloadCsvFile = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvData.map((row) => row.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sample_api_requests.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <button onClick={downloadCsvFile}>샘플 파일 다운로드</button>
    </div>
  );
};

export default SampleFileDownload;
