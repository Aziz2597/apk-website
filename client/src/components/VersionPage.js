import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; // add useNavigate for redirect
import './../styles/Home.css';

const VersionPage = () => {
  const { appName } = useParams();
  const navigate = useNavigate(); // for redirect
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch versions and check if both original and modified exist
  const fetchVersions = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/uploads/${appName}/versions`);
      setVersions(res.data);
      setError(null);

      // Check if both 'original' and 'modified' exist in versions
      const hasOriginal = res.data.some(v => v[2].startsWith('originalFile'));
      const hasModified = res.data.some(v => !v[2].startsWith('originalFile'));

      // If both are missing, delete icon and redirect
      if (!hasOriginal && !hasModified) {
        // Delete icon file via backend
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:5000/api/uploads/${appName}/icon`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });

          console.log('Icon deleted as both versions are missing');
        } catch (iconErr) {
          console.error('Error deleting icon:', iconErr.response?.data || iconErr.message);
        }
        navigate('/profile');
      }
    } catch (err) {
      console.error('Fetch versions error:', err.response?.data || err.message);
      setError('Failed to fetch versions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [appName]);

  const handleDelete = async (index) => {
    const versionToDelete = versions[index];
    const appVersion = versionToDelete[1];
    const fileType = versionToDelete[2].startsWith('originalFile') ? 'original' : 'modified';

    if (!window.confirm(`Are you sure you want to delete ${fileType} file of version ${appVersion}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/uploads/${appName}/${encodeURIComponent(appVersion)}?type=${fileType}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`, // if applicable
          },
        }
      );

      // Refresh versions and run the logic again
      await fetchVersions();
    } catch (error) {
      console.error('Failed to delete file:', error.response?.data || error.message);
      alert('Failed to delete file. Please try again.');
    }
  };

  if (isLoading) return <p>Loading versions...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="home-container">
      <h1 className="home-title">Versions for {appName}</h1>
      <ul className="uploads-list">
        {versions.map((version, index) => (
          <li key={index} className="upload-item">
            <div className="upload-name">
              {version[0]} ({version[2].startsWith('originalFile') ? 'OG' : 'MOD'})
            </div>
            <div className="upload-version-delete">
              <span className="upload-version">{version[1]}</span>
              <button
                className="delete-button"
                onClick={() => handleDelete(index)}
                aria-label="Delete version"
                title="Delete version"
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VersionPage;
