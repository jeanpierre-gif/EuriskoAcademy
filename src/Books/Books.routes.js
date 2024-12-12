const express = require('express');
const BookController = require('./Books.controller');
const uploadPicture = require('../Middlewares/MulterMiddleware');

const router = express.Router();
router.post('/create-book',uploadPicture.single("coverImageUrl") ,BookController.createBook);
router.get('/get-book-by-id/:bookId',BookController.getBookById);
router.delete('/delete-book/:bookId',BookController.deleteBookById);
router.get('/getbooks',BookController.fetchAllBooks);
router.put('/update-book/:bookId',uploadPicture.single("coverImageUrl"),BookController.UpdateBook);
router.get('/status-update-book/:bookId',BookController.togglePublishStatus);
router.get('/get-published-books',BookController.GetPublishedBooks);
router.get('/get-book/:bookId',BookController.getBook);
router.get('/get-kpis',BookController.getkpis);
module.exports = router;
