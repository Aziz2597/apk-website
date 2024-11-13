import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './../styles/Profile.css';

const Profile = () => {
  const [uniqueUploads, setUniqueUploads] = useState([]);
  const [isLoadingUploads, setIsLoadingUploads] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserUploads = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/uploads/files', {
          withCredentials: true,
        });
        const uploads = res.data;

        // Create a map to store unique uploads by appName
        const uniqueUploadsMap = {};
        uploads.forEach(upload => {
          if (!uniqueUploadsMap[upload.appName]) {
            uniqueUploadsMap[upload.appName] = upload;
          }
        });

        // Convert map values to array to set in state
        const uniqueUploadsArray = Object.values(uniqueUploadsMap);
        setUniqueUploads(uniqueUploadsArray);
      } catch (err) {
        console.error('Fetch uploads error:', err.response.data);
        setError('Failed to fetch uploads');
      } finally {
        setIsLoadingUploads(false);
      }
    };

    fetchUserUploads();
  }, []);

  if (isLoadingUploads) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const handleItemClick = (upload) => {
    navigate(`/${upload.appName}/versions`);
  };
  return (
    <div className="profile-container">
      <h1 className="profile-title">Admin's Profile</h1>
      <div className="admin-section">
        <h2 className="admin-title">Uploaded Files ({uniqueUploads.length})</h2>
        <ul className="admin-list">
          {uniqueUploads.map(upload => (
            <li key={upload._id} className="admin-item" onClick={() => handleItemClick(upload)}>
              {upload.iconFilename ? (
                <img src={`http://localhost:5000/api/uploads/icon/${upload.iconFilename}`} alt={`${upload.appName}`} className="upload-icon" />
              ) : (
                <img src="default_icon_path" alt="default icon" className="upload-icon" />
              )}
              <span className="upload-name">{upload.appName}</span>

            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Profile;
