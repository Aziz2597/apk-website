import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './../styles/Upload.css';

const Upload = () => {
  const { isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [appName, setAppName] = useState('');
  const [appVersion, setAppVersion] = useState('');
  const [category, setCategory] = useState('');
  const [originalFile, setOriginalFile] = useState(null);
  const [modFile, setModFile] = useState(null);
  const [iconFile, setIconFile] = useState(null); // Add state for icon file

  const onOriginalFileChange = e => setOriginalFile(e.target.files[0]);
  const onModFileChange = e => setModFile(e.target.files[0]);
  const onIconFileChange = e => setIconFile(e.target.files[0]); // Add handler for icon file change
  const onAppNameChange = e => setAppName(e.target.value);
  const onAppVersionChange = e => setAppVersion(e.target.value);
  const onCategoryChange = e => setCategory(e.target.value);

  const onSubmit = async e => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Unauthorized access');
      return;
    }
    const formData = new FormData();
    formData.append('appName', appName);
    formData.append('appVersion', appVersion);
    formData.append('category', category);
    formData.append('originalFile', originalFile);
    formData.append('modFile', modFile);
    formData.append('iconFile', iconFile); // Append icon file to formData

    try {
      const res = await axios.post('http://localhost:5000/api/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true,
      });
      console.log(res.data);
      navigate('/profile');
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <div className="upload-container">
      <h1 className="upload-title">Upload APK</h1>
      {isAdmin ? (
        <form onSubmit={onSubmit} className="upload-form">
          <label className="upload-label" htmlFor="appName">App Name:</label>
          <input
            type="text"
            id="appName"
            value={appName}
            onChange={onAppNameChange}
            required
            className="upload-input"
          />
          <label className="upload-label" htmlFor="appVersion">App Version:</label>
          <input
            type="text"
            id="appVersion"
            value={appVersion}
            onChange={onAppVersionChange}
            required
            className="upload-input"
          />
          <select
            value={category}
            onChange={onCategoryChange}
            required
            className="upload-input"
          >
            <option value="" disabled>Select Category</option>
            <option value="games">Games</option>
            <option value="communication">Communication</option>
            <option value="art and design">Art and Design</option>
            <option value="entertainment">Entertainment</option>
            <option value="editing tools">Editing Tools</option>
          </select>
          <label className="upload-label" htmlFor="originalFile">Original APK:</label>
          <input
            type="file"
            id="originalFile"
            onChange={onOriginalFileChange}
            className="upload-input"
          />
          <label className="upload-label" htmlFor="modFile">Mod APK (optional):</label>
          <input
            type="file"
            id="modFile"
            onChange={onModFileChange}
            className="upload-input"
          />
          <label className="upload-label" htmlFor="iconFile">Icon File:</label> {/* Add icon file input */}
          <input
            type="file"
            id="iconFile"
            onChange={onIconFileChange}
            className="upload-input"
            accept="image/*" // Accept only image files
          />
          <button type="submit" className="upload-button">Upload</button>
        </form>
      ) : (
        <p>User Not Logged In</p>
      )}
    </div>
  );
};

export default Upload;
