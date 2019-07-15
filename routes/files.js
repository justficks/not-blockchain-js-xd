const express = require('express');
const router = express.Router();
const file = require('../models/files');

router.get('/getFiles', (req, res) => {
    file.getFiles(req, res);
});

router.post('/upload', file.multer.single('file'), (req, res) => {
    file.uploadFile(req, res);
});

module.exports = router;