const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UploadSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  appName: {
    type: String,
    required: true
  },
  appVersion: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  originalFilename: {
    type: String
  },
  originalFilepath: {
    type: String
  },
  modFilename: {
    type: String
  },
  modFilepath: {
    type: String
  },
  iconFilename: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});


module.exports = mongoose.model('Upload', UploadSchema);
