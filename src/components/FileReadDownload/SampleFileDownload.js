import React, { useEffect, useState } from "react";

const SampleFileDownload = () => {
  // ✅ 기본값은 "가져오지 못함"으로 설정
  const [userId, setUserId] = useState("가져오지 못함");

  // ✅ localStorage에서 사용자 ID 가져오기
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId); // localStorage에서 ID를 가져와 상태 업데이트
    }
  }, []);

  const downloadCsvFile = () => {
    // ✅ 샘플 CSV 데이터 (다양한 HTTP 메서드 포함)
    const csvData = [
      ["method", "url", "userId", "params", "headers", "body"],
      [
        "POST",
        "https://example.com/api",
        userId,
        '[{"key":"userId","value":"123"},{"key":"active","value":"true"}]',
        '[{"key":"Content-Type","value":"application/json"},{"key":"Authorization","value":"Bearer example-token"}]',
        '{"name":"John Doe","email":"john.doe@example.com"}',
      ],
      [
        "GET",
        "https://example.com/api",
        userId,
        '[{"key":"userId","value":"123"}]',
        '[{"key":"Content-Type","value":"application/json"}]',
        "",
      ],
      [
        "PUT",
        "https://example.com/api/resource/123",
        userId,
        "",
        '[{"key":"Content-Type","value":"application/json"},{"key":"Authorization","value":"Bearer example-token"}]',
        '{"name":"Jane Doe","email":"jane.doe@example.com"}',
      ],
      [
        "DELETE",
        "https://example.com/api/resource/123",
        userId,
        "",
        '[{"key":"Authorization","value":"Bearer example-token"}]',
        "",
      ],
    ];

    // ✅ CSV 파일 생성 및 다운로드
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
      <button onClick={downloadCsvFile}>
        샘플 파일 다운로드 (사용자 ID: {userId})
      </button>
    </div>
  );
};

export default SampleFileDownload;
