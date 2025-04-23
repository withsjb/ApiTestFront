import React, { useEffect, useState } from "react";

const SampleFileDownload = () => {
  const [userId, setUserId] = useState("가져오지 못함");

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) setUserId(storedUserId);
  }, []);

  const downloadCsvFile = () => {
    // 1. 메모리에 CSV 내용 생성 (실제 테스트 가능한 공개 API 예시)
    const rows = [
      ["method", "url", "userId", "params", "headers", "body"],
      [
        "GET",
        "https://jsonplaceholder.typicode.com/posts/1",
        userId,
        "[]",
        "[]",
        ""
      ],
      [
        "POST",
        "https://jsonplaceholder.typicode.com/posts",
        userId,
        "[]",
        JSON.stringify([{ "key": "Content-Type", "value": "application/json" }]),
        JSON.stringify({ "title": "foo", "body": "bar", "userId": 1 })
      ],
      [
        "PUT",
        "https://jsonplaceholder.typicode.com/posts/1",
        userId,
        "[]",
        JSON.stringify([{ "key": "Content-Type", "value": "application/json" }]),
        JSON.stringify({ "id": 1, "title": "baz", "body": "qux", "userId": 1 })
      ],
      [
        "DELETE",
        "https://jsonplaceholder.typicode.com/posts/1",
        userId,
        "[]",
        "[]",
        ""
      ]
    ];

    // 2. 각 필드를 따옴표로 감싸서 CSV 형식 유지
    const csvContent = rows.map(row => 
      row.map(field => 
        typeof field === 'string' ? `"${field.replace(/"/g, '""')}"` : `"${field}"`
      ).join(',')
    ).join('\n');

    // 3. 파일 다운로드
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sample_api_requests.csv";
    link.click();
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
