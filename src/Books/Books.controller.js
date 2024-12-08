const Book = require("./Books.model");
const bookValidationSchema = require("../Validators/Books.validator");

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

//get book by id
const getBookById = async (req, res) => {
 const bookId = req.params.bookId;
 try{
   const book = await Book.findById(bookId).select('-updatedAt -publishedDate');
   if(!book){
   res.status(404).json({success:false,message:"book not found"});

   }
   res.status(200).json({ success: true, data: book });

 }catch(err){
  res.status(500).json({success:false, message:err.message});
 }
}

//delete book by id
const deleteBookById = async (req, res) => {
  const bookId = req.params.bookId;
  console.log(bookId);
  try{
   const book = await Book.findByIdAndDelete(bookId);
   if(!book) return res.status(404).json({ success: false, message: 'Book not found' });
  
   res.status(200).json({ success: true, message: 'Book deleted successfully' });

  }catch(err){
    res.status(500).json({ success: false, message: err.message });

  }
}
module.exports = { createBook,getBookById ,deleteBookById};
