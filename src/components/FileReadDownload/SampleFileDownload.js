import React, { useEffect, useState } from "react";

const SampleFileDownload = () => {
  const [userId, setUserId] = useState("가져오지 못함");

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) setUserId(storedUserId);
  }, []);

  const downloadCsvFile = () => {
    // CSV 헤더에 authType, token, authData 추가
    const rows = [
      ["method", "url", "userId", "params", "headers", "body", "authType", "token", "authData"],
      [
        "GET",
        "https://jsonplaceholder.typicode.com/posts/1",
        userId,
        "[]",
        "[]",
        "",
        "None",     // 기본: No Auth
        "",
        "{}"
      ],
      [
        "POST",
        "https://jsonplaceholder.typicode.com/posts",
        userId,
        "[]",
        JSON.stringify([{ key: "Content-Type", value: "application/json" }]),
        JSON.stringify({ title: "foo", body: "bar", userId: 1 }),
        "None",
        "",
        "{}"
      ],
      [
        "PUT",
        "https://jsonplaceholder.typicode.com/posts/1",
        userId,
        "[]",
        JSON.stringify([{ key: "Content-Type", value: "application/json" }]),
        JSON.stringify({ id: 1, title: "baz", body: "qux", userId: 1 }),
        "None",
        "",
        "{}"
      ],
      [
        "DELETE",
        "https://jsonplaceholder.typicode.com/posts/1",
        userId,
        "[]",
        "[]",
        "",
        "None",
        "",
        "{}"
      ]
    ];

    // CSV 변환
    const csvContent = rows
      .map(row =>
        row
          .map(field =>
            typeof field === "string"
              ? `"${field.replace(/"/g, '""')}"`
              : `"${field}"`
          )
          .join(",")
      )
      .join("\n");

    // 파일 다운로드 처리
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
