const express = require('express');
const {createAuthor} = require('./Authors.controller');
const uploadPicture = require('../config/Multer.config');

const router = express.Router();

router.post('/add-author',uploadPicture.single("profileImageUrl") ,createAuthor);

module.exports = router;