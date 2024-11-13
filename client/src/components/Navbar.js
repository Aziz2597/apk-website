import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './../styles/Navbar.css';
import logo from './../assets/logo.png'; // Import your logo
import axios from 'axios';

const Navbar = () => {
  const { logout, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [uploads, setUploads] = useState([]);
  const [filteredUploads, setFilteredUploads] = useState([]);

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

  const handleLogoClick = () => {
    navigate('/home');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = () => {
    // Check if searchTerm is undefined or null before processing
    if (searchTerm === undefined || searchTerm === null) {
      return;
    }
  
    const filtered = uploads.filter(upload =>
      upload.appName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUploads(filtered);
    navigate('/search', { state: { filteredUploads: filtered } });
  };
  const handleLogout = () => {
    logout();
    navigate('/home'); 
  };
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  return (
    <>
      <nav className="navbar">
        <img src={logo} alt="Logo" className="navbar-logo" onClick={handleLogoClick} />
        <ul className="navbar-menu">
          {isAdmin && <li className="navbar-item"><Link to="/upload" className="navbar-link">Upload</Link></li>}
          {isAdmin && <li className="navbar-item"><Link to="/profile" className="navbar-link">Profile</Link></li>}
        </ul>
        <div className="navbar-right">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            className="search-input"
            placeholder="Search..."
          />
          <i className="material-icons search-icon" onClick={handleSearchSubmit}>search</i>

          {isAdmin ? (
            <button onClick={handleLogout} className="logout-button">Logout</button>
          ) : (
            <button onClick={() => navigate('/login')} className="logout-button">Admin</button>
          )}
        </div>
      </nav>
      <div className="subnavbar">
        <Link to="/category/games" className="subnavbar-link">Games</Link>
        <Link to="/category/communication" className="subnavbar-link">Communication</Link>
        <Link to="/category/art-and-design" className="subnavbar-link">Art and Design</Link>
        <Link to="/category/entertainment" className="subnavbar-link">Entertainment</Link>
        <Link to="/category/editing-tools" className="subnavbar-link">Editing Tools</Link>
      </div>
    </>
  );
};

export default Navbar;
