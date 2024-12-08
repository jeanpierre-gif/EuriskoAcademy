const Book = require("./Books.model");
const bookValidationSchema = require("../Validators/Books.validator");

const createBook = async (req, res) => {
  try {
    const { error, value } = bookValidationSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
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

module.exports = { createBook };
