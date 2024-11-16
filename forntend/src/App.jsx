import React, { useState } from "react";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [detections, setDetections] = useState([]);
  const [annotatedImage, setAnnotatedImage] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("image", selectedFile);

    // Send POST request to server to upload and process the image
    const response = await fetch("http://localhost:5000/detect", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      setDetections(data.detections);
      setAnnotatedImage(data.annotated_image); // Base64 encoded image
    } else {
      alert("Error: " + data.error);
    }
  };

  const handleClick = () => {
    document.getElementById("file-input").click();
  };

  return (
    <div className="flex flex-col items-center mb-10">
      <h1 className="text-3xl font-semibold m-5">Object Detection</h1>

      {/* Upload and Detect Buttons */}
      <div className="flex justify-center">
        <button
          onClick={handleClick}
          className="px-8 py-2 m-4 bg-blue-500 text-white rounded-2xl cursor-pointer"
        >
          Upload
        </button>
        <button
          className="bg-gray-800 text-white px-8 py-2 m-4 rounded-2xl disabled:bg-gray-400"
          onClick={handleUpload}
          disabled={!selectedFile}
        >
          Detect
        </button>
      </div>

      {/* Images Section */}
      <div className="flex justify-center gap-8 p-8 mx-auto">
        {/* Uploaded Image */}
        <div className="flex-1">
          <input
            id="file-input"
            className="hidden"
            type="file"
            onChange={handleFileChange}
          />
          {selectedFile && (
            <div>
              <h2 className="text-xl font-semibold mb-2 text-center">Uploaded Image:</h2>
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Uploaded preview"
                className="w-full max-h-96 object-contain rounded-lg shadow-lg"
              />
            </div>
          )}
        </div>

        {/* Annotated Image */}
        {annotatedImage && (
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2 text-center">Detection Results:</h2>
            <img
              src={`data:image/jpeg;base64,${annotatedImage}`}
              alt="Annotated result"
              className="w-full max-h-96 object-contain rounded-lg shadow-lg"
            />
          </div>
        )}
      </div>

      {/* Detected Objects List */}
      {detections.length > 0 && (
        <div className="w-full max-w-3xl mt-6 p-4 bg-gray-100 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-center">Detected Objects:</h3>
          <ul className="space-y-2">
            {detections.map((det, index) => (
              <li
                key={index}
                className="p-3 bg-white rounded-md shadow-sm border border-gray-300"
              >
                <strong>{det.class}</strong> - Confidence: {det.confidence.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
