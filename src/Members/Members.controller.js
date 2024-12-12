const MemberService = require("./Members.service");
const Author = require("../Authors/Authors.model");
const Member = require("../Members/Members.model");
const Book = require("../Books/Books.model");
const {
  memberValidationSchema,
  updateMemberValidationSchema,
} = require("../validators/Members.validator");

class MemberController {
  async addMember(req, res) {
    try {
      const { error, value } = memberValidationSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          details: error.details.map((err) => err.message),
        });
      }

      const newMember = await MemberService.addMember(value);

      res.status(201).json({
        success: true,
        message: "Member added successfully",
        data: newMember,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
  async updateMember(req, res) {
    try {
      const { memberId } = req.params;

      //validate the input first
      const { error, value } = updateMemberValidationSchema.validate(req.body, {
        abortEarly: false,
        allowUnknown: true,
      });
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          details: error.details.map((err) => err.message),
        });
      }

      //if validation succeeded,call the service to update the member
      const updatedMember = await MemberService.updateMember(memberId, value);

      res.status(200).json({
        success: true,
        message: "Member updated successfully",
        data: updatedMember,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async deleteMember(req, res) {
    try {
      const { memberId } = req.params;
      //call the service to delete the member
      const deletedMember = await MemberService.deleteMember(memberId);

      res.status(200).json({
        success: true,
        message: "Member deleted successfully",
        data: deletedMember,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
  async getMembers(req, res) {
    const { page, limit, name, username, email } = req.query;
    try {
      const response = await MemberService.searchMembers({
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10,
        search: {
          name: name || "",
          username: username || "",
          email: email || "",
        },
      });

      res.status(200).json({
        success: true,
        ...response,
      });
    } catch (error) {
      console.error("Error in getMembers controller:", error.message);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch members",
      });
    }
  }

  //Web APIs
  async getMemberProfile(req, res) {
    const memberId = req.params.memberId;
    try {
      const memberProfile = await MemberService.getMemberProfile(memberId);
      res.status(200).json({
        success: true,
        data: memberProfile,
      });
    } catch (error) {
      console.error("Error fetching member profile:", error.message);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch member profile",
      });
    }
  }
  async borrowBook(req, res) {
    const memberId = req.headers["user-id"];
    const { bookId } = req.body;

    try {
      const result = await MemberService.borrowBook(memberId, bookId);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Error borrowing book:", error.message);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to borrow the book",
      });
    }
  }
  async returnBook(req, res) {
    const memberId = req.headers["user-id"];
    const { bookId } = req.body;

    try {
      const result = await MemberService.returnBook(memberId, bookId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Error returning book:", error.message);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to return the book",
      });
    }
  }

  async getMembersBorrowedBooks(req, res) {
    try {
      const memberId = req.params.memberId;

      const borrowedBooks = await MemberService.getMembersBorrowedBooks(
        memberId
      );

      return res.status(200).json({
        success: true,
        data: borrowedBooks,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
  async subscribeToBook(req, res) {
    try {
      const memberId = req.headers["user-id"];
      const { bookId } = req.body;

      const result = await MemberService.subscribeToBook(memberId, bookId);
      res.status(200).json({ data: result });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
}

module.exports = new MemberController();
