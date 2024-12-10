const Book = require("./Books.model");
const Author = require("../Authors/Authors.model");
const bookValidationSchema = require("../Validators/Books.validator");
const paginate = require("../Services/PaginationService");
const createBook = async (req, res) => {
  try {
    const { error, value } = bookValidationSchema.validate(req.body, {
      //this is used to not stop the validation after the first field fails
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        //mappign to display all the errors
        details: error.details.map((err) => err.message),
      });
    }
    //check if author id is valid
    const authorExists = await Author.findById(value.authorId);
    if (!authorExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid authorId: Author does not exist",
      });
    }
    const file = req.file;

    const book = new Book({
      ...value,
      coverImageUrl: file ? file.filename : null,
    });

    await book.save();
    res.status(200).json({ success: true, data: book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
//fetch all books
const fetchAllBooks = async (req, res) => {
  try {
    //extract query parameters
    const { page, limit, genre, title, isbn } = req.query;

    //build filters for genre and title and isbn
    const filters = {};
    if (isbn) {
      //$options:"i" is for case insensitive
      filters.isbn = { $regex: isbn, $options: "i" };
    }
    
    if (genre) filters.genre = genre;
    if (title) {
      filters.$or = [
        { "title.en": { $regex: title, $options: "i" } },
        { "title.ar": { $regex: title, $options: "i" } },
        { isbn: { $regex: title, $options: "i" } },
      ];
    }

    //pagination options
    const options = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      sort: { createdAt: -1, authorId: 1 }, //sorting by createdAt and authorId
      projection: "-updatedAt -coverImageUrl", //dont include these fields in the response
    };

    //get paginated results using the service
    const paginatedResults = await paginate(Book, filters, options);

    res.status(200) .json({ success: true, ...paginatedResults });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//get book by id
const getBookById = async (req, res) => {
  const bookId = req.params.bookId;
  try {
    const book = await Book.findById(bookId).select(
      "-updatedAt -publishedDate"
    );
    if (!book) {
      res.status(404).json({ success: false, message: "book not found" });
    }
    res.status(200).json({ success: true, data: book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
//update an existing book
const UpdateBook = async (req, res) => {
try{
  const bookId = req.params.bookId;
  //check if the id is provided
  if (!bookId || bookId.trim() === "") {
    return res
      .status(400)
      .json({ success: false, message: "Missing or invalid book-id" });
  }
  const book = await Book.findById(bookId);
  if(!book) return res.status(404).json({ success: false, message:"book not found" });
  if(book.isPublished) return res.status(404).json({ success: false, message:"book cannot be updated because it is published" });
  const updates = req.body;
  console.log(updates);

  if(updates.isPublished !==undefined){
    return res.status(400).json({
      success: false,
      message:"cannot change publish status of the book"
    })
  }
  const Image = req.file;
  const updatedData = {
   title:{
    en: updates.title?.en || book.title.en,
    ar: updates.title?.ar || book.title.ar
   },
   isbn: updates.isbn || book.isbn,
   genre: updates.genre || book.genre,
   description:{
    en: updates.description?.en || book.description.en,
    ar: updates.description?.ar || book.description.ar
   },
   numberOfAvailableCopies: updates.numberOfAvailableCopies || book.numberOfAvailableCopies,
   isBorrowable: updates.isBorrowable || book.isBorrowable,
   numberOfBorrowableDays: updates.numberOfBorrowableDays || book.numberOfBorrowableDays,
   isOpenToReviews: updates.isOpenToReviews || book.isOpenToReviews,
   minAge : updates.minAge || book.minAge,
   authorId : updates.authorId || book.authorId,
   coverImageUrl: Image ? Image.filename : book.coverImageUrl,
   publishedDate : updates.publishedDate || book.publishedDate
  }
  const {error, value} = bookValidationSchema.validate(updatedData,{
    abortEarly: false,
  });
  if(error){
    return res.status(400).json({
      success:false,
      message:"Validation error",
      details: error.details.map((err)=>err.message)
    });
  }
  book.title.en= updatedData.title.en;
  book.title.ar = updatedData.title.ar;
  book.isbn = updatedData.isbn;
  book.genre = updatedData.genre;
  book.description.en  = updatedData.description.en;
  book.description.ar = updatedData.description.ar;
  book.numberOfAvailableCopies = updatedData.numberOfAvailableCopies;
  book.numberOfBorrowableDays = updatedData.numberOfBorrowableDays;
  book.isBorrowable = updatedData.isBorrowable;
  book.isOpenToReviews = updatedData.isOpenToReviews;
  book.minAge = updatedData.minAge;
  book.authorId = updatedData.authorId;
  book.coverImageUrl = updatedData.coverImageUrl;
  book.publishedDate = updatedData.publishedDate;

  await book.save();
  res
  .status(200)
  .json({
    success: true,
    message: "book updated successfully",
    data: book,
  });
}catch (err) {
  res.status(500).json({ success: false, message: err.message });
}

}


//delete book by id
const deleteBookById = async (req, res) => {
  const bookId = req.params.bookId;
  console.log(bookId);
  try {
    const book = await Book.findByIdAndDelete(bookId);
    if (!book)
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });

    res
      .status(200)
      .json({ success: true, message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
module.exports = { createBook, getBookById, deleteBookById, fetchAllBooks,UpdateBook };
