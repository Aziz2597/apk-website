import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './../styles/DownloadPage.css';

const DownloadPage = () => {
  const { state } = useLocation();
  const { upload } = state;
  const [countdown, setCountdown] = useState(5);
  const [showDownloadLinks, setShowDownloadLinks] = useState(false);

  const handleGenerateLink = () => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(interval);
          setShowDownloadLinks(true);
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="download-page">
      {upload.iconFilename ? (
        <img src={`http://localhost:5000/api/uploads/icon/${upload.iconFilename}`} alt={`${upload.appName}`}className="download-icon" />
      ) : (
        <img src="default_icon_path" alt="default icon" className="download-icon" />
      )}
      <h1 className="download-name">{upload.appName}</h1>
      <h2 className="download-version">{upload.appVersion}</h2>
      {!showDownloadLinks ? (
        <button className="generate-link-button" onClick={handleGenerateLink}>
          {countdown === 5 ? 'Generate download link' : `Generating link in ${countdown} seconds`}
        </button>
      ) : (
        <div className="download-buttons">
          {upload.originalFilename ? (
            <button className="download-original" onClick={() => window.open(`http://localhost:5000/api/uploads/${upload._id}?type=original`, '_blank')}>
              Download Original APK
            </button>
          ) : (
            <button className="download-original-disabled" disabled>
              Original APK Not Uploaded
            </button>
          )}
          {upload.modFilename ? (
            <button className="download-mod" onClick={() => window.open(`http://localhost:5000/api/uploads/${upload._id}?type=modified`, '_blank')}>
              Download Mod APK
            </button>
          ) : (
            <button className="download-mod-disabled" disabled>
              Mod APK Not Uploaded
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DownloadPage;

