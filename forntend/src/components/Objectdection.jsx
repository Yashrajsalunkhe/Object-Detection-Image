import React, { useState } from "react";

function ObjectDetection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [detections, setDetections] = useState([]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:8000/detect/", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setDetections(data.detections);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Object Detection with YOLOv5</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!selectedFile}>
        Upload and Detect
      </button>

      {detections.length > 0 && (
        <div>
          <h2>Detections</h2>
          <ul>
            {detections.map((det, index) => (
              <li key={index}>
                Class: {det.class}, Confidence: {det.confidence.toFixed(2)}
                , Box: {JSON.stringify(det.box)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ObjectDetection;
