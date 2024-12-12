const bookService = require("./Books.service");
class BookController {
  async createBook(req, res) {
    try {
      const book = await bookService.createBook(req.body, req.file);
      res.status(200).json({ success: true, data: book });
    } catch (err) {
      console.log(err.statusCode);
      const statusCode = err.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: err.message,
        ...(err.details && { details: err.details }),
      });
    }
  }
  //fetch all books
  async fetchAllBooks(req, res) {
    try {
      const result = await bookService.fetchAllBooks(req.query);
      res.status(200).json({ sucess: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  //get book by id
  async getBookById(req, res) {
    try {
      const book = await bookService.getBookById(req.params.bookId);
      res.status(200).json({ success: true, data: book });
    } catch (err) {
      res.status(err.statusCode || 500).json({
        success: false,
        message: err.message,
      });
    }
  }
  //update an existing book
  async UpdateBook(req, res) {
    try {
      const bookId = req.params.bookId;
      const updates = req.body;
      const file = req.file;

      const updatedBook = await bookService.updateBook(bookId, updates, file);

      res.status(200).json({
        success: true,
        message: "Book updated successfully",
        data: updatedBook,
      });
    } catch (err) {
      res.status(err.statusCode || 500).json({
        success: false,
        message: err.message,
        details: err.details || null,
      });
    }
  }
  //delete book by id
  async deleteBookById(req, res) {
    try {
      const bookId = req.params.bookId;
      const result = await bookService.deleteBookById(bookId);

      res.status(200).json(result);
    } catch (err) {
      res.status(err.statusCode || 500).json({
        success: false,
        message: err.message,
      });
    }
  }

  //publish and unpublish book
  async togglePublishStatus(req, res) {
    try {
      const { bookId } = req.params;
      const result = await bookService.togglePublishStatus(bookId);
      res.status(200).json(result);
    } catch (err) {
      res.status(err.statusCode || 500).json({
        success: false,
        message: err.message,
      });
    }
  }

  //KPIs
  async getkpis(req, res) {
    try {
      const kpis = await bookService.getkpis();
      res.json({
        success: true,
        kpis,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  //Web APIs
  async GetPublishedBooks(req, res) {
    try {
      const { page = 1, limit = 10, genre } = req.query;
      const language = req.headers["accept-language"] || "en";

      // Call the service to get the published books
      const paginatedResults = await bookService.GetPublishedBooks({
        page,
        limit,
        genre,
        language,
      });

      res.status(200).json({
        success: true,
        ...paginatedResults,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
  //get book by id
  async getBook(req, res) {
    try {
      const bookId = req.params.bookId;
      const language = req.headers["accept-language"] || "en";

      const bookDetails = await bookService.getBook(bookId, language);
      res.status(200).json({ success: true, data: bookDetails });
    } catch (err) {
      const status = err.status || 500;
      const message = err.message;
      res.status(status).json({ success: false, message });
    }
  }
}
module.exports = new BookController();
