const MemberService = require("./Members.service");
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
    const { page, limit, name,username,email} = req.query;
    try {
      const response = await MemberService.searchMembers({
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10,
        search: {
          name: name || '',
          username: username || '',
          email: email || '',
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
}

module.exports = new MemberController();
