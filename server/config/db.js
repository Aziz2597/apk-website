const mongoose = require('mongoose');
const { MongoClient, GridFSBucket } = require('mongodb');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Access the underlying MongoDB native client
    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

    console.log('MongoDB connected...');
    return bucket; // Return the GridFSBucket instance for use in other parts of the application
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
