const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const path = require('path');
const Upload = require('../../models/Upload'); // Correct import path for Upload model
const auth = require('../../middlewares/auth'); // Import auth middleware

// Mongo URI
const mongoURI = process.env.MONGO_URI;

// Create mongo connection
const conn = mongoose.createConnection(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Init gfs
let gfs;
conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
      const fileInfo = {
        filename: filename,
        bucketName: 'uploads'
      };
      resolve(fileInfo);
    });
  }
});

const upload = multer({ storage });

router.post('/', auth, upload.fields([{ name: 'originalFile' }, { name: 'modFile' }, { name: 'iconFile' }]), async (req, res) => {
  try {
    const { appName, appVersion, category } = req.body;
    const originalFile = req.files.originalFile ? req.files.originalFile[0] : null;
    const modFile = req.files.modFile ? req.files.modFile[0] : null;
    const iconFile = req.files.iconFile ? req.files.iconFile[0] : null;

    let existingFiles = await Upload.find({ appName, category, appVersion: { $lt: appVersion } });

    for (let file of existingFiles) {
      await Upload.deleteOne({ _id: file._id });
    }

    // Create a new entry for the uploaded file
    const newFile = new Upload({
      user: req.user.id,
      appName,
      appVersion,
      category,
      originalFilename: originalFile ? originalFile.filename : null,
      originalFilepath: originalFile ? originalFile.id : null,
      modFilename: modFile ? modFile.filename : null,
      modFilepath: modFile ? modFile.id : null,
      iconFilename: iconFile ? iconFile.filename : null
    });

    await newFile.save();
    res.json({
      msg: 'Files uploaded and metadata saved!',
      file: newFile
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

router.get('/:appName/versions', async (req, res) => {
  const { appName } = req.params;

  try {
    const entries = await Upload.find({ appName });
    const versions = [];

    entries.forEach(entry => {
      if (entry.modFilename) {
        versions.push([
          entry.appName,
          entry.appVersion,
          entry.modFilename
        ]);
      }

      if (entry.originalFilename) {
        versions.push([
          entry.appName,
          entry.appVersion,
          entry.originalFilename
        ]);
      }
    });

    // Return the formatted versions as a 2D array
    res.json(versions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get('/icon/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    gfs.files.findOne({ filename: filename }, (err, file) => {
      if (err || !file) {
        return res.status(404).json({ msg: 'No file exists' });
      }

      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

router.get('/files', auth, async (req, res) => {
  try {
    const files = await Upload.find({ user: req.user.id });
    res.json(files);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const files = await Upload.find({ category });

    if (!files) {
      return res.status(404).json({ msg: 'Files not found' });
    }

    res.json(files);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

router.get('/user', auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const fileId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ msg: 'Invalid file ID' });
    }

    const file = await Upload.findById(fileId);

    if (!file) {
      return res.status(404).json({ msg: 'File not found' });
    }

    let filename, fileIdToDownload;
    if (req.query.type === 'original') {
      if (!file.originalFilepath) {
        return res.status(404).json({ msg: 'Original file not uploaded' });
      }
      filename = file.originalFilename;
      fileIdToDownload = file.originalFilepath;
    } else if (req.query.type === 'modified') {
      if (!file.modFilepath) {
        return res.status(404).json({ msg: 'Modified file not uploaded' });
      }
      filename = file.modFilename;
      fileIdToDownload = file.modFilepath;
    } else {
      return res.status(400).json({ msg: 'Specify file type (original or modified)' });
    }

    gfs.openDownloadStream(mongoose.Types.ObjectId(fileIdToDownload))
      .pipe(res)
      .on('error', (err) => {
        console.error('Error streaming file:', err);
        res.status(500).json({ msg: 'Error streaming file', error: err.message });
      });

  } catch (err) {
    console.error('Error downloading file:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});


module.exports = router;
