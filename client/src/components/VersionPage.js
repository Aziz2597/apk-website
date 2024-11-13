import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './../styles/Home.css'; // Ensure this path matches your project structure

const VersionPage = () => {
  const { appName } = useParams();
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/uploads/${appName}/versions`);
        setVersions(res.data);
      } catch (err) {
        console.error('Fetch versions error:', err.response.data);
        setError('Failed to fetch versions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersions();
  }, [appName]);


  if (isLoading) {
    return <p>Loading versions...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="home-container">
      <h1 className="home-title">Versions for {appName}</h1>
      <ul className="uploads-list">
        {versions.map((version, index) => (
          <li key={index} className="upload-item">
            <div className="upload-name">
              {version[0]} ({version[2].startsWith('originalFile') ? 'OG' : 'MOD'})
            </div>
            <div className="upload-version">
              {version[1]}
            </div>
           
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VersionPage;
