const Member = require('./Members.model'); 
const Book = require('../Books/Books.model');
const Paginator = require('../Services/PaginationService');
class MemberService {
  async addMember(memberData) {
    //check if the username or email already exists
    const existingUser = await Member.findOne({
      $or: [
        { username: memberData.username },
        { email: memberData.email },
      ],
    });
    if (memberData.subscribedBooks && memberData.subscribedBooks.length > 0) {
        const books = await Book.find({ _id: { $in: memberData.subscribedBooks } });
        if (books.length !== memberData.subscribedBooks.length) {
          throw new Error('Some of the subscribed books do not exist');
        }
      }
    if (existingUser) {
      throw new Error('Username or email already exists');
    }
    const member = new Member(memberData);

    return await member.save();
  }
  async updateMember(memberId, updateData) {
    // Validate if the member exists
    const member = await Member.findById(memberId);
    if (!member) {
      throw new Error('Member not found');
    }
    console.log(updateData.subscribedBooks);

    // If `subscribedBooks` is being updated, validate their existence
    if (updateData.subscribedBooks && updateData.subscribedBooks.length > 0) {
      const books = await Book.find({ _id: { $in: updateData.subscribedBooks } });
      if (books.length !== updateData.subscribedBooks.length) {
        throw new Error('Some of the subscribed books do not exist');
      }
    }

    // Update the member with the new data
    Object.assign(member, updateData);
    return await member.save();
  }
  async deleteMember(memberId) {
    // Check if the member exists and delete
    const deletedMember = await Member.findByIdAndDelete(memberId);
    if (!deletedMember) {
      throw new Error('Member not found');
    }

    return deletedMember;
  }

  //search for members
  async searchMembers({page =1 , limit= 10,search={}}){
    const filter = {};
    if (search.name) {
      filter.name = { $regex: search.name, $options: 'i' }; 
    }
    if (search.username) {
      filter.username = { $regex: search.username, $options: 'i' }; 
    }
    if (search.email) {
      filter.email = { $regex: search.email, $options: 'i' };
    }
     const sort = {returnRate:-1};
     const projection = 'name username email borrowedBooks returnRate';
     const paginator = new Paginator(Member, filter, { page, limit, sort, projection });
    const response= await paginator.paginate();  
     response.data = response.data.map(member=>({
      ...member.toObject(), //convert the member to a plain object to add the number of borrowed books
      borrowedBooksCount: member.borrowedBooks.length,   
     }))
     return response;
  }
}

module.exports = new MemberService(); 
