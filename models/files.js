const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.enable('trust proxy'); 

// Create mongo connection
const conn = mongoose.createConnection('mongodb://localhost:27017/mongouploads', { useNewUrlParser: true } );

// Init gfs
let gfs;

conn.once('open', () => {
    // Init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
    url: 'mongodb://localhost:27017/mongouploads',
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = file.originalname;
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads',
            metadata: {'inBlock': 0}
          };
          resolve(fileInfo);
        });
      });
    }
});
const upload = multer({ storage });
module.exports.multer = upload;

module.exports.getFiles = (req, res) => {
    gfs.files.find().toArray((err, files) => {
        // Check if files
        if (!files || files.length === 0) {
          res.render('files', { files: false });
        } else {
          files.map(file => {
            if ( file.metadata.inBlock == 0) {
              file.inBlock = true;
            } else
              file.inBlock = false;
          })
          res.render('files', { files: files });
        }
    });
};