// client/src/App.js

import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Upload from './components/Upload';
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import Home from './components/Home';
import AuthContext from './context/AuthContext'; 
import DownloadPage from './components/DownloadPage';
import SearchResults from './components/SearchResults';
import CategoryPage from './components/CategoryPage';
import VersionPage from './components/VersionPage';
import './App.css';
const ProtectedRoute = ({ element }) => {
  const { isAdmin, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  return isAdmin ? element : <Navigate to="/login" />;
};
const App = () => {

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />}  />
          <Route path="/login" element={<Login />} />
          <Route path="/upload" element={<ProtectedRoute element={<Upload />} />} />
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
          <Route path="/home" element={<Home />} />
          <Route path="/download/:id" element={<DownloadPage />} />
          <Route path="/search" element={<SearchResults />}   /> 
          <Route path="/category/:category" element={<CategoryPage />} /> 
          <Route path="/:appName/versions" element={<ProtectedRoute element={<VersionPage />} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
