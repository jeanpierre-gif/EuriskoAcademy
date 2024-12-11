const express = require('express');
const {createBook,getBookById,deleteBookById,fetchAllBooks,UpdateBook,GetPublishedBooks,getBook,togglePublishStatus,getkpis} = require('./Books.controller');
const uploadPicture = require('../Middlewares/MulterMiddleware');

const router = express.Router();
router.post('/create-book',uploadPicture.single("coverImageUrl") ,createBook);
router.get('/get-book-by-id/:bookId',getBookById);
router.delete('/delete-book/:bookId',deleteBookById);
router.get('/getbooks',fetchAllBooks);
router.post('/update-book/:bookId',uploadPicture.single("coverImageUrl"),UpdateBook);
router.get('/status-update-book/:bookId',togglePublishStatus);
router.get('/get-published-books', GetPublishedBooks);
router.get('/get-book/:bookId',getBook);
router.get('/get-kpis',getkpis);
module.exports = router;
