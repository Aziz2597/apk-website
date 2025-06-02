client\src\components\Home.js:
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
  const [uploads, setUploads] = useState([]);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/uploads');
        setUploads(res.data);
      } catch (err) {
        console.error(err.response.data);
      }
    };

    fetchUploads();
  }, []);

  return (
    <div>
      <h1>APK Files</h1>
      <ul>
        {uploads.map(upload => (
          <li key={upload._id}>
            <a href={upload.filePath} target="_blank" rel="noopener noreferrer">
              {upload.fileName}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;


client\src\components\Login.js:
// Login.js

import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      await login(formData); // Call login function from context
      navigate('/home'); // Navigate to home after successful login
    } catch (err) {
      console.error('Login error:', err.response.data);
      // Handle login error, display message, etc.
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={onSubmit}>
        <input type="email" name="email" value={email} onChange={onChange} required />
        <input type="password" name="password" value={password} onChange={onChange} required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;



client\src\components\Navbar.js:
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav>
      <ul>
        <li>
          <Link to="/home">Home</Link>
        </li>
        <li>
          <Link to="/upload">Upload</Link>
        </li>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
      </ul>
      {user && (
        <div style={{ position: 'absolute', right: '10px', bottom: '10px' }}>
          Logged in as: {user.name} <button onClick={logout}>Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;



client\src\components\Profile.js:
// Profile.js

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [uploads, setUploads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserUploads = async () => {
      if (user) {
        try {
          const res = await axios.get(`http://localhost:5000/api/uploads/user/${user._id}`, {
            withCredentials: true,
          });
          setUploads(res.data);
        } catch (err) {
          console.error('Fetch uploads error:', err.response.data);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserUploads();
  }, [user]);

  if (!user) {
    return <p>User not logged in</p>;
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Profile</h1>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <h2>Your Uploaded Files</h2>
      <ul>
        {uploads.map(upload => (
          <li key={upload._id}>
            <a href={upload.filePath} target="_blank" rel="noopener noreferrer">
              {upload.fileName}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Profile;



//client\src\components\Register.js:
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const { name, email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/users/register', formData);
      login(res.data);
      navigate('/');
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={onSubmit}>
        <input type="text" name="name" value={name} onChange={onChange} required />
        <input type="email" name="email" value={email} onChange={onChange} required />
        <input type="password" name="password" value={password} onChange={onChange} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;


client\src\components\Upload.js:
import React, { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Upload = () => {
  const { user } = useContext(AuthContext);
  const [file, setFile] = useState(null);

  const onFileChange = e => setFile(e.target.files[0]);

  const onSubmit = async e => {
    e.preventDefault();
    if (!user) {
      alert('User Not Logged In');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('http://localhost:5000/api/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(res.data);
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <div>
      <h1>Upload APK</h1>
      {user ? (
        <form onSubmit={onSubmit}>
          <input type="file" onChange={onFileChange} required />
          <button type="submit">Upload</button>
        </form>
      ) : (
        <p>User Not Logged In</p>
      )}
    </div>
  );
};

export default Upload;



client\src\context\AuthContext.js:
// AuthContext.js

import React, { createContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (formData) => {
    try {
      const res = await axios.post('http://localhost:5000/api/users/login', formData, {
        withCredentials: true,
      });
      setUser(res.data); // Assuming login response returns user data
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err) {
      console.error('Login error:', err.response.data);
      throw err; // Handle login error
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/api/users/logout', {}, {
        withCredentials: true,
      });
      setUser(null);
      localStorage.removeItem('user');
    } catch (err) {
      console.error('Logout error:', err.response.data);
      throw err; // Handle logout error
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;


client\src\App.js:
// App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Upload from './components/Upload';
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import Home from './components/Home';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/home" element={<Home />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;



server\config\db.js:
const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;


server\config\default.json:
{
    "mongoURI": "mongodb://127.0.0.1:27017/apk-website",
    "jwtSecret": "a45bac581743dc66708705680db4c9d3e040d605005ff22b8ad573a36c8b669b"
  }
  
server\middlewares\auth.js:
// middlewares/auth.js

const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
  // Get token from cookie
  const token = req.cookies.token;

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));

    // Check token expiration
    if (decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ msg: 'Token expired, please log in again' });
    }

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};



server\models\Upload.js:
const mongoose = require('mongoose');

const UploadSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Upload', UploadSchema);


server\models\User.js:
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

module.exports = mongoose.model('User', UserSchema);



server\routes\api\auth.js:
// middlewares/auth.js

const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
  // Get token from cookie
  const token = req.cookies.token;

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};


server\routes\api\uploads.js:
const express = require('express');
const multer = require('multer');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const Upload = require('../../models/Upload');
const router = express.Router();

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: 'us-west-2'
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: 'your-bucket-name',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    }
  })
});

// Upload File
router.post('/', upload.single('file'), async (req, res) => {
  const { user } = req.body;
  const file = req.file;
  try {
    const newUpload = new Upload({
      user,
      fileName: file.originalname,
      filePath: file.location
    });
    await newUpload.save();
    res.json(newUpload);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get All Files
router.get('/', async (req, res) => {
  try {
    const uploads = await Upload.find().populate('user', ['name', 'email']);
    res.json(uploads);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;



server\routes\api\users.js:
// routes/api/users.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const config = require('config');

const router = express.Router();

// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post(
    '/register',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            let user = await User.findOne({ email });

            if (user) {
                return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
            }

            user = new User({
                name,
                email,
                password
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();

            // Create payload for JWT
            const payload = {
                user: {
                    id: user.id
                }
            };

            // Sign JWT
            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: '30m' }, // Expires in 30 minutes
                (err, token) => {
                    if (err) throw err;

                    // Set cookie with the token
                    res.cookie('token', token, {
                        httpOnly: true,
                        secure: false, // Set to true if using HTTPS
                        maxAge: 30 * 60 * 1000 // Max age in milliseconds (30 minutes)
                    });

                    // Respond with token or user data if needed
                    res.json({ token });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            let user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            // Create payload for JWT
            const payload = {
                user: {
                    id: user.id
                }
            };

            // Sign JWT
            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: 360000 },
                (err, token) => {
                    if (err) throw err;

                    // Set cookie with the token
                    res.cookie('token', token, {
                        httpOnly: true,
                        secure: false, // Set to true if using HTTPS
                    });

                    // Respond with token or user data if needed
                    res.json({ token });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

module.exports = router;



server\server.js:
// server.js

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const app = express();

connectDB();

app.use(cors({
  origin: 'http://localhost:3000', // Update with your frontend URL
  credentials: true, // Allow credentials (cookies)
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/uploads', require('./routes/api/uploads'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



