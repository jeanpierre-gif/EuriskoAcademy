const express = require('express');
const {createBook,getBookById,deleteBookById,fetchAllBooks,UpdateBook} = require('./Books.controller');
const uploadPicture = require('../config/Multer.config');

const router = express.Router();
router.post('/create-book',uploadPicture.single("coverImageUrl") ,createBook);
router.get('/get-book-by-id/:bookId',getBookById);
router.delete('/delete-book/:bookId',deleteBookById);
router.get('/getbooks',fetchAllBooks);
router.post('/update-book/:bookId',uploadPicture.single("coverImageUrl"),UpdateBook);
module.exports = router;
