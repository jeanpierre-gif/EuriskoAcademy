const Author = require("./Authors.model");

const createAuthor = async (req, res) => {
  try {
    const { name, email, biography, birthDate } = req.body;
    const profileImageUrl = req.file ? req.file.path : null;
    const author = new Author({
      name,
      email,
      biography,
      profileImageUrl,
      birthDate,
    });
    console.log(author);
    await author.save();
    res.status(200).json({ success: true, data: author });
  } catch (err) {
    return res.status(500).json({success:false, message: err.message });
  }
};
module.exports = { createAuthor };
