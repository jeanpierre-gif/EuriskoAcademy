const Author = require("./Authors.model");
const AuthorValidationSchema = require('../Validators/Authors.validator');
const createAuthor = async (req, res) => {
  try {
    const {error, value}=AuthorValidationSchema.validate(req.body,{
        abortEarly:false
    });
    if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          //mappign to display all the errors
          details: error.details.map((err) => err.message),
        });
      }
      const existingEmail = await Author.findOne({email:value.email});
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "author with this email already exists",
        });
      }   
    const profileImageUrl = req.file ;
    const author = new Author({
     ...value,
      profileImageUrl:profileImageUrl ? profileImageUrl.filename : null,
    });
    console.log(author);
    await author.save();
    res.status(200).json({ success: true, data: author });
  } catch (err) {
    return res.status(500).json({success:false, message: err.message });
  }
};
module.exports = { createAuthor };
