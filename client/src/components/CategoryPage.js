// CategoryPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const getFilesByCategory = async (category) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/uploads/category/${category}`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  };

const CategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [uploads, setUploads] = useState([]);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const data = await getFilesByCategory(category);
        setUploads(data);
      } catch (error) {
        console.error('Error fetching files:', error);
       
      }
    };

    fetchUploads();
  }, [category]);

  const handleItemClick = (upload) => {
    navigate(`/download/${upload._id}`, { state: { upload } });
  };

  return (
    <div className="category-page">
    <h2>Files in {category}</h2>
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

export default CategoryPage;
