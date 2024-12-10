const express = require('express');
const {createBook,getBookById,deleteBookById,fetchAllBooks} = require('./Books.controller');
const uploadPicture = require('../config/Multer.config');

const router = express.Router();
router.post('/create-book',uploadPicture.single("coverImageUrl") ,createBook);
router.get('/get-book-by-id/:bookId',getBookById);
router.delete('/delete-book/:bookId',deleteBookById);
router.get('/getbooks',fetchAllBooks);
module.exports = router;
