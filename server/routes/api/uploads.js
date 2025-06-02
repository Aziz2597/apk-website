const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const path = require('path');
const Upload = require('../../models/Upload'); // Correct import path for Upload model
const auth = require('../../middlewares/auth'); // Import auth middleware
const { ObjectId } = require('mongodb');

// Mongo URI
const mongoURI = process.env.MONGO_URI;

// Create mongo connection
const conn = mongoose.createConnection(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Init gfs
let gridFSBucket;
conn.once('open', () => {
  gridFSBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });
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

    const filesCursor = await gridFSBucket.find({ filename }).toArray();
    const file = filesCursor[0];

    if (!file) {
      return res.status(404).json({ msg: 'No file exists' });
    }

    res.set('Content-Type', file.contentType || 'image/png');
    res.set('Content-Disposition', `inline; filename="${file.filename}"`);

    const readstream = gridFSBucket.openDownloadStream(file._id);
    readstream.pipe(res);

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

    // Sanitize appName and appVersion to be safe in filenames
    const sanitizedAppName = file.appName.replace(/[^a-zA-Z0-9]/g, '');
    const sanitizedVersion = file.appVersion.replace(/[^a-zA-Z0-9.]/g, '');

    if (req.query.type === 'original') {
      if (!file.originalFilepath) {
        return res.status(404).json({ msg: 'Original file not uploaded' });
      }
      fileIdToDownload = file.originalFilepath;
      filename = `${sanitizedAppName}_${sanitizedVersion}_OG.apk`;
    } else if (req.query.type === 'modified') {
      if (!file.modFilepath) {
        return res.status(404).json({ msg: 'Modified file not uploaded' });
      }
      fileIdToDownload = file.modFilepath;
      filename = `${sanitizedAppName}_${sanitizedVersion}_MOD.apk`;
    } else {
      return res.status(400).json({ msg: 'Specify file type (original or modified)' });
    }

    // Determine MIME type
    const mime = require('mime-types');
    const mimeType = mime.lookup(filename) || 'application/vnd.android.package-archive';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    gridFSBucket.openDownloadStream(mongoose.Types.ObjectId(fileIdToDownload))
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


// DELETE a version by appName and appVersion
// DELETE a specific file (original or modified) by appName, appVersion and type query param
router.delete('/:appName/:appVersion', auth, async (req, res) => {
  const { appName, appVersion } = req.params;
  const { type } = req.query;  // expect 'original' or 'modified'

  if (!type || !['original', 'modified'].includes(type)) {
    return res.status(400).json({ msg: "Please specify file type to delete: 'original' or 'modified'" });
  }

  try {
    // Find the Upload document
    const uploadEntry = await Upload.findOne({ appName, appVersion });

    if (!uploadEntry) {
      return res.status(404).json({ msg: 'Version not found' });
    }

    let fileIdToDelete;
    if (type === 'original') {
      fileIdToDelete = uploadEntry.originalFilepath;
      if (!fileIdToDelete) {
        return res.status(404).json({ msg: 'Original file not found for this version' });
      }
    } else if (type === 'modified') {
      fileIdToDelete = uploadEntry.modFilepath;
      if (!fileIdToDelete) {
        return res.status(404).json({ msg: 'Modified file not found for this version' });
      }
    }

    // Delete the file from GridFS
    if (mongoose.Types.ObjectId.isValid(fileIdToDelete)) {
      await gridFSBucket.delete(new mongoose.Types.ObjectId(fileIdToDelete));
    }

    // Update the Upload document by removing the file reference and filename fields for that type
    if (type === 'original') {
      uploadEntry.originalFilepath = null;
      uploadEntry.originalFilename = null;
    } else if (type === 'modified') {
      uploadEntry.modFilepath = null;
      uploadEntry.modFilename = null;
    }

    // If both original and modified files are now missing, delete the entire document
    if (!uploadEntry.originalFilepath && !uploadEntry.modFilepath) {
      await Upload.deleteOne({ _id: uploadEntry._id });
      return res.json({ msg: `Both files deleted, version ${appVersion} of app ${appName} removed` });
    }

    // Else save updated Upload doc
    await uploadEntry.save();

    res.json({ msg: `${type} file deleted from version ${appVersion} of app ${appName}`, uploadEntry });

  } catch (err) {
    console.error('Delete file error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

router.delete('/:appName/icon', async (req, res) => {
  const { appName } = req.params;

  try {
    const versionsCollection = db.collection('versions'); // or wherever version docs are stored
    const filesCollection = db.collection('uploads.files');

    // Find the version document for this app (latest version or the one you want)
    const versionDoc = await versionsCollection.findOne({ appName });

    if (!versionDoc || !versionDoc.iconFilename) {
      return res.status(404).json({ msg: 'Icon filename not found for this app' });
    }

    // Find the GridFS file by filename
    const iconFileDoc = await filesCollection.findOne({ filename: versionDoc.iconFilename });

    if (!iconFileDoc) {
      return res.status(404).json({ msg: 'Icon file not found in GridFS' });
    }

    // Delete the file from GridFS using its _id
    await bucket.delete(ObjectId(iconFileDoc._id));

    // Optionally: Remove iconFilename field from versionDoc or update versionDoc if needed
    // await versionsCollection.updateOne({ _id: versionDoc._id }, { $unset: { iconFilename: "" } });

    return res.status(200).json({ msg: 'Icon file deleted successfully' });
  } catch (err) {
    console.error('Error deleting icon file:', err);
    return res.status(500).json({ msg: 'Server error deleting icon file' });
  }
});


module.exports = router;
