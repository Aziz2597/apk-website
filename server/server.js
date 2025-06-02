//server\server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const path = require('path');
const app = express();

connectDB();

app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/uploads', require('./routes/api/uploads'));
app.use('/api/files', require('./routes/api/files'));
app.use('/icons', express.static(path.join(__dirname, 'icons')));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
