const Member = require("./Members.model");
const Book = require("../Books/Books.model");
const Paginator = require("../Services/PaginationService");
const {sendEmail} = require("../Services/Mailer.service");
class MemberService {
  async addMember(memberData) {
    //check if the username or email already exists
    const existingUser = await Member.findOne({
      $or: [{ username: memberData.username }, { email: memberData.email }],
    });

    if (memberData.subscribedBooks && memberData.subscribedBooks.length > 0) {
      const books = await Book.find({
        _id: { $in: memberData.subscribedBooks },
      });
      if (books.length !== memberData.subscribedBooks.length) {
        throw new Error("Some of the subscribed books do not exist");
      }
    }

    if (existingUser) {
      throw new Error("Username or email already exists");
    }

    const member = new Member(memberData);
    return await member.save();
  }

  async updateMember(memberId, updateData) {
    //check if the member exists
    const member = await Member.findById(memberId);
    if (!member) {
      throw new Error("Member not found");
    }

    // If subscribedbooks is being updated,check their existence
    if (updateData.subscribedBooks && updateData.subscribedBooks.length > 0) {
      const books = await Book.find({
        _id: { $in: updateData.subscribedBooks },
      });
      if (books.length !== updateData.subscribedBooks.length) {
        throw new Error("Some of the subscribed books do not exist");
      }
    }

    //update the member with the new data
    Object.assign(member, updateData);
    return await member.save();
  }

  async deleteMember(memberId) {
    //check if the member exists and delete
    const deletedMember = await Member.findByIdAndDelete(memberId);
    if (!deletedMember) {
      throw new Error("Member not found");
    }

    return deletedMember;
  }

  //search for members
  async searchMembers({ page = 1, limit = 10, search = {} }) {
    const filter = {};
    if (search.name) {
      filter.name = { $regex: search.name, $options: "i" };
    }
    if (search.username) {
      filter.username = { $regex: search.username, $options: "i" };
    }
    if (search.email) {
      filter.email = { $regex: search.email, $options: "i" };
    }
    const sort = { returnRate: -1 };
    const projection = "name username email borrowedBooks returnRate";
    const paginator = new Paginator(Member, filter, {
      page,
      limit,
      sort,
      projection,
    });
    const response = await paginator.paginate();
    response.data = response.data.map((member) => ({
      ...member.toObject(), //convert the member to a plain object to add the number of borrowed books
      borrowedBooksCount: member.borrowedBooks.length,
    }));
    return response;
  }

  //Web APIs
  async getMemberProfile(memberId) {
    try {
      const member = await Member.findById(memberId);
      if (!member) {
        throw new Error("Member not found");
      }
      return member;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async borrowBook(memberId, bookId) {
    try {
      const member = await Member.findById(memberId);
      const book = await Book.findById(bookId).populate('authorId'); // Populate authorId to get author details

      if (!member) throw new Error("Member not found");
      if (!book) throw new Error("Book not found");

      if (!book.isBorrowable) throw new Error("This book is not borrowable");
      if (book.numberOfAvailableCopies <= 0)
        throw new Error("No available copies left");

      if (member.returnRate < 30)
        throw new Error(
          "Member cannot borrow books with a return rate below 30%"
        );

      const memberAge =
        new Date().getFullYear() - new Date(member.birthDate).getFullYear();
      if (memberAge < book.minAge)
        throw new Error(
          "Member does not meet the minimum age requirement to borrow this book"
        );

      member.borrowedBooks.push({
        borrowedBookId: bookId,
        borrowedDate: new Date(),
        returnDate: null,
      });
      book.numberOfAvailableCopies -= 1;
      const authorEmail = book.authorId.email;
      if (authorEmail) {
        const emailSubject = `Your book "${book.title.en}" has been borrowed`;
        const emailText = `Hello,\n\nWe wanted to inform you that your book "${book.title.en}" has been borrowed by a member.`;
        const emailHtml = `<p>Hello,</p><p>We wanted to inform you that your book "<strong>${book.title.en}</strong>" has been borrowed by a member.</p>`;
                await sendEmail({
          to: authorEmail,
          subject: emailSubject,
          text: emailText,
          html: emailHtml,
        });
      }
      await member.save();
      await book.save();

      return { success: true, message: "Book borrowed successfully!" };
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async returnBook(memberId, bookId) {
    try {
      const member = await Member.findById(memberId);
      const book = await Book.findById(bookId);

      if (!member) throw new Error("Member not found");
      if (!book) throw new Error("Book not found");

      //find the borrowed book record,borrowedbooks is an array of object
      const borrowedBook = member.borrowedBooks.find(
        (b) => b.borrowedBookId.toString() === bookId
      );

      if (!borrowedBook)
        throw new Error("Book was not borrowed by this member");

      //check if the book is already returned
      if (borrowedBook.returnDate)
        throw new Error("Book has already been returned");
      //set the return date and check if it was returned on time
      borrowedBook.returnDate = new Date();
      const dueDate = new Date(borrowedBook.borrowedDate);
      console.log(book.numberOfBorrowableDays);
      dueDate.setDate(dueDate.getDate() + book.numberOfBorrowableDays);

      const isReturnedOnTime = borrowedBook.returnDate <= dueDate;

      //update returnRate if the book was returned on time
      if (isReturnedOnTime) {
        member.returnRate = Math.min(100, member.returnRate + 5);
      }else{
        member.returnRate = Math.max(0, member.returnRate - 5);

      }

      //save the member and update available copies of the book
      await member.save();
      await book.save();

      return { success: true, message: "Book returned successfully!" };
    } catch (err) {
      throw new Error(err.message);
    }
  }

  //calculate the return rate
  async calculateReturnRate(member) {
    const totalBooks = member.borrowedBooks.length;
    let returnedOnTime = 0;

    for (const borrowedBook of member.borrowedBooks) {
      //get the book from the database using the borrowedBookId
      const book = await Book.findById(borrowedBook.borrowedBookId);

      if (!book) {
        throw new Error("Book not found");
      }

      //calculate the due date based on the borrow date and the book borrowable days
      const dueDate = new Date(borrowedBook.borrowedDate);
      dueDate.setDate(dueDate.getDate() + book.numberOfBorrowableDays);

      //check if the book was returned on time
      if (
        borrowedBook.returnDate &&
        new Date(borrowedBook.returnDate) <= dueDate
      ) {
        returnedOnTime += 1;
      }
    }

    return totalBooks > 0 ? (returnedOnTime / totalBooks) * 100 : 0;
  }

  async getMembersBorrowedBooks(memberId) {
    try {
      const member = await Member.findById(memberId);
  
      if (!member) {
        throw new Error('Member not found');
      }  
      const currentDate = new Date();
  
      //retrieve all borrowed books
      const borrowedBooksDetails = await Promise.all(
        member.borrowedBooks.map(async (borrowedBook) => {
          //fetch the book details directly from the book collection
          const book = await Book.findById(borrowedBook.borrowedBookId);
            if (!book) {
            console.warn('Book not found for borrowedBookId:', borrowedBook.borrowedBookId);
            return null;
          }
  
          const borrowedDate = new Date(borrowedBook.borrowedDate);
          const dueDate = new Date(borrowedDate);
          const daysToBorrow = book.numberOfBorrowableDays; 
          dueDate.setDate(dueDate.getDate() + daysToBorrow);
  
          const daysLeft = Math.ceil((dueDate - currentDate) / (1000 * 60 * 60 * 24));
          const hoursLeft = Math.ceil((dueDate - currentDate) / (1000 * 60 * 60));
  
          // Determine flags
          let warningFlag = false;
          let expiredFlag = false;
  
          if (hoursLeft <= 12 && hoursLeft > 0) {
            warningFlag = true; // Less than 12 hours before return
          }
          if (currentDate > dueDate) {
            expiredFlag = true; //book is overdue
          }
  
          return {
            borrowedBookId: borrowedBook.borrowedBookId,
            title: book.title,
            isReturned: !!borrowedBook.returnDate,
            daysLeft: borrowedBook.returnDate ? null : daysLeft, // Null if returned
            warningFlag: borrowedBook.returnDate ? false : warningFlag, //no warning flag if returned
            expiredFlag: borrowedBook.returnDate ? false : expiredFlag, //no expiry if returned
          };
        })
      );
  
      return borrowedBooksDetails;
    } catch (err) {
      console.error('Error in getMembersBorrowedBooks:', err.message);
      throw err;
    }
  }
  async subscribeToBook(memberId, bookId){
    const book = await Book.findById(bookId);
  if (!book) {
    throw new Error('Book not found');
  }
  const member = await Member.findById(memberId);
  if (!member) {
    throw new Error('Member not found');
  }
  let message='';
  if(member.subscribedBooks.includes(bookId)){
    member.subscribedBooks = member.subscribedBooks.filter(
      (subscribedBookId) => subscribedBookId.toString() !== bookId.toString()
    ); 
    message = 'Unsubscription successful';

  }else{
    member.subscribedBooks.push(bookId);
    message = 'Subscription successful';

  }
  await member.save();
  return message;

  }
  
}

module.exports = new MemberService();
