const express = require('express');
const router = express.Router();
const file = require('../models/files');

router.get('/getFiles', (req, res) => {
    file.getFiles(req, res);
});

router.get('/file/:filename', (req, res) => {
    file.streamFile(req, res);
});

router.post('/file/:id', (req, res) => {
    file.deleteFile(req, res);
});

router.post('/addInBC/:id', (req, res) => {
    console.log("Полетели")
    bc.addInBCAndDB(req, res);
});

router.post('/upload', file.multer.single('file'), (req, res) => {
    file.uploadFile(req, res);
});

module.exports = router;