const Book = require("./Books.model");
const Author = require("../Authors/Authors.model");
const Member = require("../Members/Members.model");
const bookValidationSchema = require("../Validators/Books.validator");
const paginate = require("../Services/PaginationService");
const emailService = require("../Services/Mailer.service");
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
    //extract query params
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

    const paginator = new paginate(Book, filters, options);

    //get paginated results using the service
    const paginatedResults = await paginator.paginate();

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
    const book = await Book.findById(bookId);
    //check if the book exists
    if (!book)
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
//check if the book is published
if(book.isPublished){
  return res.status(400).json({ success: false, message: "cannot delete a published book" });
}
await Book.findByIdAndDelete(bookId);
    res
      .status(200)
      .json({ success: true, message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//publish and unpublish book
const togglePublishStatus = async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    book.isPublished = !book.isPublished;
    await book.save();

    if (book.isPublished) {
      const members = await Member.find({ subscribedBooks: bookId });
      try {
             // Send email notifications to all subscribed members
      const emailPromises = members.map((member) =>
         emailService.sendEmail({
          to: "jpnakhoul407@gmail.com",
          subject: `Book Published: ${book.title.en}`,
          text: `The book "${book.title.en}" has been published.`,
        }));
        await Promise.all(emailPromises);
        console.log("Notification email sent successfully");
      } catch (err) {
        console.error("Error sending email notification:", err.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Book ${book.isPublished ? "published" : "unpublished"} successfully`,
      data: book,
    });
  } catch (err) {
    console.error("Error toggling publish status:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};


//Web APIs
const GetPublishedBooks =async (req, res) =>{
  try{
    //get the query params
  const {page = 1, limit = 10, genre} = req.query;
  //get the language from the header and set the default to english incase not provided
  const language = req.headers['accept-language'] || 'en';
  const validLanguage = ['en', 'ar'];
  const lang = validLanguage.includes(language) ? language : 'en';
  console.log(lang);
  //we are going to return the books that are published
  const filters = {isPublished:true};
  //if the genre is provided by the user
  if(genre){
    filters.genre =genre; 
  }
  const options = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 10,
    sort: { numberOfAvailableCopies: -1 }, //sort by available copies desc
    projection: {
      title: `$title.${lang}`,
      description: `$description.${lang}`, 
      genre: 1,
      coverImageUrl: 1,
      isBorrowable: 1,
    },
  };
  const paginator = new paginate(Book, filters, options);

  const paginatedResults = await paginator.paginate();

    res.status(200).json({
      success: true,
      ...paginatedResults,
    });
  }catch(err){
    return res.status(500).json({ success: false, message:err.message });
  }
}
//get book by id
const getBook = async (req,res)=>{
  try{
    const bookId= req.params.bookId;
    if(!bookId || bookId.trim()===''){
      return res.status(400).json({success: false, message:"invalid book id"});
    }
    
    const book = await Book.findById(bookId);
    if(!book) return res.status(404).json({success: false, message:"Book not found"});
    //check if the book is published
    if(book.isPublished == false) return res.status(404).json({success: false, message:"book cannot be accessed"});
    const language = req.headers['accept-language'] || 'en';
    const validLanguage = ['en','ar'];
    const lang = validLanguage.includes(language) ? language : 'en';
    const response = {
      title: book.title[lang],
      description: book.description[lang],
      isbn: book.isbn,
      genre: book.genre,
      numberOfAvailableCopies: book.numberOfAvailableCopies,
      numberOfBorrowableDays: book.numberOfBorrowableDays,
      isOpenToReviews: book.isOpenToReviews,
      authorId: book.authorId,
      publishedDate: book.publishedDate,
    };
    res.status(200).json({ success: true, data: response });

  }catch(err){
    return res.status(500).json({success: false, message:err.message});
  }
}
module.exports = { createBook, getBookById, deleteBookById, fetchAllBooks,UpdateBook,GetPublishedBooks,getBook,togglePublishStatus };
