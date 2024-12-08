const express = require('express');
const {createBook} = require('./Books.controller');
const uploadPicture = require('../config/Multer.config');

const router = express.Router();
router.post('/createBook',uploadPicture.single("coverImageUrl") ,createBook);

module.exports = router;
