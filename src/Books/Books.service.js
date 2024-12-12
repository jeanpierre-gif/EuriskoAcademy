const Book = require("./Books.model");
const Author = require("../Authors/Authors.model");
const Member = require("../Members/Members.model");
const bookValidationSchema = require("../Validators/Books.validator");
const paginate = require("../Services/PaginationService");
const emailService = require("../Services/Mailer.service");

class BookService {
  async createBook(data, file) {
    const { error, value } = bookValidationSchema.validate(data, {
      //this is used to not stop the validation after the first field fails
      abortEarly: false,
    });

    if (error) {
      const validationError = new Error("Validation error");
      validationError.statusCode = 400;
      validationError.details = error.details.map((err) => err.message);
      throw validationError;
    }
    //check if author id is valid
    const authorExists = await Author.findById(value.authorId);
    if (!authorExists) {
      const authorError = new Error("Invalid authorId: Author does not exist");
      authorError.statusCode = 400;
      throw authorError;
    } 

    const book = new Book({
      ...value,
      coverImageUrl: file ? file.filename : null,
    });

    await book.save();
    return book;
}
  //fetch all books
  async fetchAllBooks(query) {
    //extract query params
    const { page, limit, genre, title, isbn } = query;
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
    return paginatedResults;
  }
  //get book by id
  async getBookById(bookId) {
    const book = await Book.findById(bookId).select(
      "-updatedAt -publishedDate"
    );
    if (!book) {
      const error = new Error("book not found");
      error.statusCode = 404;
      throw error;
    }
    return book;
  }

  //update an existing book
  async updateBook(bookId, updates, file) {
    //check if the id is provided
    if (!bookId || bookId.trim() === "") {
      const error = new Error("missing or invalid book-id");
      error.statusCode = 400;
      throw error;
    }

    const book = await Book.findById(bookId);
    if (!book) {
      const error = new Error("book not found");
      error.statusCode = 404;
      throw error;
    }

    if (book.isPublished) {
      const error = new Error("book cannot be updated because it is published");
      error.statusCode = 400;
      throw error;
    }

    if (updates.isPublished !== undefined) {
      const error = new Error("cannot change publish status of the book");
      error.statusCode = 400;
      throw error;
    }

    //add file update if a new image is uploaded
    if (file) {
      updates.coverImageUrl = file.filename;
    }
    //validate the updates against the schema
    const { error } = bookValidationSchema.validate(updates, {
      abortEarly: false,
    });

    if (error) {
      const validationError = new Error("Validation error");
      validationError.details = error.details.map((err) => err.message);
      validationError.statusCode = 400;
      throw validationError;
    }
    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      { $set: updates },
      { new: true, runValidators: true } //return updated document and validate it
    );
    return updatedBook;
  }
  //delete book by id
  async deleteBookById(bookId) {
    if (!bookId || bookId.trim() === "") {
      const error = new Error("missing or invalid book-id");
      error.statusCode = 400;
      throw error;
    }
    //check if the book exists
    const book = await Book.findById(bookId);
    if (!book) {
      const error = new Error("book not found");
      error.statusCode = 404;
      throw error;
    }
    //check if the book is published
    if (book.isPublished) {
      const error = new Error("cannot delete a published book");
      error.statusCode = 400;
      throw error;
    }
    //if all success, delete it
    await Book.findByIdAndDelete(bookId);

    return { success: true, message: "book deleted successfully" };
  }

  //publish and unpublish book
  async togglePublishStatus(bookId) {
    if (!bookId || bookId.trim() === "") {
      const error = new Error("Missing or invalid book-id");
      error.statusCode = 400;
      throw error;
    }

    const book = await Book.findById(bookId);
    if (!book) {
      const error = new Error("Book not found");
      error.statusCode = 404;
      throw error;
    }

    //switch the publication status
    book.isPublished = !book.isPublished;
    await book.save();

    //send email notifications to all subscribed members
    if (book.isPublished) {
      const members = await Member.find({ subscribedBooks: bookId });

      const emailPromises = members.map((member) =>
        emailService.sendEmail({
          to: member.email,
          subject: `Book Published: ${book.title.en}`,
          text: `The book "${book.title.en}" has been published.`,
        })
      );

      try {
        await Promise.all(emailPromises);
        console.log("Notification emails sent successfully");
      } catch (err) {
        console.error("Error sending email notifications:", err.message);
      }
    }

    return {
      success: true,
      message: `Book ${
        book.isPublished ? "published" : "unpublished"
      } successfully`,
      data: book,
    };
  }

  //KPIs
  async getkpis() {
    const totalBooks = await Book.countDocuments(); //total number of books
    const publishedBooks = await Book.countDocuments({ isPublished: true }); //published books

    const booksPublishRate =
      totalBooks === 0 ? 0 : (publishedBooks / totalBooks) * 100; //if no books, return 0%

    const members = await Member.find(); //get all members
    const totalReturnRate = members.reduce(
      (acc, member) => acc + member.returnRate,
      0
    );
    const averageReturnRate =
      members.length === 0 ? 0 : totalReturnRate / members.length; //if no members, return 0%
    return {
      booksPublishRate,
      averageReturnRate,
    };
  }

  //Web APIs
  async GetPublishedBooks({ page, limit, genre, language }) {
    //check if the language provided in the header is acceptable, if not set the default to english
    const lang = ["en", "ar"].includes(language) ? language : "en";
    console.log(lang);
    //we are going to return the books that are published
    const filters = { isPublished: true };
    //if the genre is provided by the user
    if (genre) {
      filters.genre = genre;
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
    return paginatedResults;
  }

  //get book by id
  async getBook(bookId,language) {
    if (!bookId || bookId.trim() === "") {
      throw { status: 400, message: "invalid book id" };
    }

    const book = await Book.findById(bookId);
    if (!book) {
      throw { status: 400, message: "invalid book id" };
    }
    //check if the book is published
    if (!book.isPublished) {
      throw { status: 404, message: "book cannot be accessed" };
    }

    const validLanguage = ["en", "ar"];
    const lang = validLanguage.includes(language) ? language : "en";
    console.log(lang);

    return {
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
  }
}

module.exports = new BookService();
