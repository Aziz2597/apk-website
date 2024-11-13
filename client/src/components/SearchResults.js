import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const { filteredUploads } = state || {};

  const handleItemClick = (upload) => {
    navigate(`/download/${upload._id}`, { state: { upload } });
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Search Results</h1>
      <ul className="uploads-list">
        {filteredUploads && filteredUploads.map(upload => (
          <li key={upload._id} className="upload-item" onClick={() => handleItemClick(upload)}>
            {upload.iconFilename ? (
              <img
                src={`http://localhost:5000/api/uploads/icon/${upload.iconFilename}`}
                alt={`${upload.appName} icon`}
                className="upload-icon"
              />
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

export default SearchResults;
