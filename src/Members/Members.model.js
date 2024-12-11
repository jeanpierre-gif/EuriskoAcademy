const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true }, 
    birthDate: { type: Date, required: true },
    subscribedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }], 
    returnRate: { type: Number, default: 0 }, 
    borrowedBooks: [
      {
        borrowedBookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' }, 
        borrowedDate: { type: Date, required: true }, 
        returnDate: { type: Date },
      },
    ],
  },
  { timestamps: true } 
);

// Export the model
module.exports = mongoose.model('Member', MemberSchema);
