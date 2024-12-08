const { ref } = require("joi");
const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema(
  {
    title: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    isbn: { type: String, unique: true, required: true },
    genre: { type: String, required: true },
    description: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    numberOfAvailableCopies: { type: Number, default: 0, required: true },
    isBorrowable: { type: Boolean, required: true, default: false },
    numberOfBorrowableDays: { type: Number, default: 0, required: true },
    isOpenToReviews: { type: Boolean, required: true, default: false },
    minAge: { type: Number, required: true },
    authorId: { type: Number, ref: "Author", required: false },
    coverImageUrl: { type: String, required: true },
    publishedDate: { type: Date, required: true },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);
module.exports = mongoose.model("book", BookSchema);
