import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './../styles/Home.css';

const Home = () => {
  const [uploads, setUploads] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/files');
        setUploads(res.data);
      } catch (err) {
        console.error(err.response ? err.response.data : err.message);
      }
    };

    fetchUploads();
  }, []);

  const handleItemClick = (upload) => {
    navigate(`/download/${upload._id}`, { state: { upload } });
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Latest APK Files</h1>
      <ul className="uploads-list">
        {uploads.map(upload => (
          <li key={upload._id} className="upload-item" onClick={() => handleItemClick(upload)}>
            {upload.iconFilename ? (
              <img src={`http://localhost:5000/api/uploads/icon/${upload.iconFilename}`} alt={`${upload.appName}`} className="upload-icon" />
            ) : (
              <img src="default_icon_path" alt="default icon" className="upload-icon" />
            )}
            <span className="upload-name">{upload.appName}</span>
            <span className="upload-version">{upload.appVersion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
