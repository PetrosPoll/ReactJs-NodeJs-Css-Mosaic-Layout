import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./app.scss";
const BASE_URL = process.env.REACT_APP_BASE_URL;

function App() {
  const [data, setData] = useState([]);
  const fileInputRef = useRef(null);
  const [uploadStatus, setUploadStatus] = useState(null);

  // Reset the value of the file input otherwise the image upload doesnt work second time without refresh the page
  const clearFileInput = () => {
    fileInputRef.current.value = "";
  };

  // When the component is created receive the data from the server
  useEffect(() => {
    getImages();
  }, []);

  // Receive the images from the server
  const getImages = () => {
    axios
      .get(`${BASE_URL}/images/`)
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  // Get triggered when the user select an image to upload
  const handleFileUpload = () => {
    const file = fileInputRef.current.files[0];
    const formData = new FormData();
    formData.append("image", file);

    return axios
      .post(`${BASE_URL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        setData(response.data);
        clearFileInput();
        setUploadStatus("success");
      })
      .catch((error) => {
        console.error("Error uploading file:", error);
        setUploadStatus("error");
      });
  };

  return (
    <div className="dynamic-mosaic-layout-grid-container">
      {/* Mapping the data and display them one by one */}
      {data.map((item, index) => (
        <div className={`grid-item-${index} grid-item-parent-div`} key={index}>
          <img src={BASE_URL + item.image} alt={`Image ${index}`} />
          <p className="grid-item-title">
            {item.article ? item.article.title : "No Title"}
          </p>
          <p className="grid-item-description">
            {item.article ? item.article.description : "No Description"}
          </p>
          <span className="grid-item-arrow">></span>
        </div>
      ))}
      <div className="page-title">
        <h2>Connect people & spaces</h2>
      </div>
      <div className="button-upload">
        <button onClick={() => fileInputRef.current.click()}>Button</button>
        <h2>{uploadStatus === "error" && <div className="upload-error">Upload failed. Please try again.</div>}</h2>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileUpload}
        accept="image/*"
      />
    </div>
  );
}

export default App;
