const Author = require("./Authors.model");
const AuthorValidationSchema = require("../Validators/Authors.validator");

//CMS APIs
const createAuthor = async (req, res) => {
  try {
    const { error, value } = AuthorValidationSchema.validate(req.body, {
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
    const existingEmail = await Author.findOne({ email: value.email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "author with this email already exists",
      });
    }
    const profileImageUrl = req.file;
    const author = new Author({
      ...value,
      profileImageUrl: profileImageUrl ? profileImageUrl.filename : null,
    });
    console.log(author);
    await author.save();
    res.status(200).json({ success: true, data: author });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

//get author by id
const getAuthorById = async (req, res) => {
  try {
    const id = req.query["author-id"];
    if (!id || id.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Missing or invalid author-id" });
    }
    console.log(id);
    const authorfound = await Author.findById(id);
    console.log(authorfound);
    if (!authorfound)
      return res
        .status(404)
        .json({ success: false, message: "Author not found" });

    res.status(200).json({ success: true, data: authorfound });
  } catch (err) {
    if (err.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid author-id format" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

//delete author by id
const deleteAuthorById = async (req, res) => {
  try {
    const id = req.query["author-id"];
    if (!id || id.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Missing or invalid author-id" });
    }
    const authorDeleted = await Author.findByIdAndDelete(id);
    if (!authorDeleted)
      return res
        .status(404)
        .json({ success: false, message: "author not found" });
    res.status(200).json({ success: true, message: "author deleted" });
  } catch (err) {
    if (err.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid author-id format" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};
//update the author details by id,only modifying the provided fields
const updateAuthorById = async (req, res) => {
  try {
    const id = req.query["author-id"];
    if (!id || id.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Missing or invalid author-id" });
    }

    //get the existing author from the database
    const author = await Author.findById(id);
    if (!author) {
      return res
        .status(404)
        .json({ success: false, message: "Author not found" });
    }

    //merge the existing author data with the new data from the req
    const updates = req.body;
    const profileImageUrl = req.file;
    //merge old values with new ones,and keep existing if not provided in the request
    const updatedData = {
      name: {
        en: updates.name?.en || author.name.en,
        ar: updates.name?.ar || author.name.ar,
      },
      biography: {
        en: updates.biography?.en || author.biography.en,
        ar: updates.biography?.ar || author.biography.ar,
      },
      email: updates.email || author.email,
      birthDate: updates.birthDate || author.birthDate,
      profileImageUrl: profileImageUrl
        ? profileImageUrl.filename
        : author.profileImageUrl,
    };

    //validate the new data
    const { error, value } = AuthorValidationSchema.validate(updatedData, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        details: error.details.map((err) => err.message),
      });
    }

    //check if the email is already in use by another author
    const existingEmail = await Author.findOne({ email: value.email });
    if (existingEmail && existingEmail._id.toString() !== id) {
      return res.status(400).json({
        success: false,
        message: "An author with this email already exists",
      });
    }

    //apply the updates to the author object
    author.name.en = updatedData.name.en;
    author.name.ar = updatedData.name.ar;
    author.biography.en = updatedData.biography.en;
    author.biography.ar = updatedData.biography.ar;
    author.email = updatedData.email;
    author.birthDate = updatedData.birthDate;
    author.profileImageUrl = updatedData.profileImageUrl;

    //save the updated author
    await author.save();
    res
      .status(200)
      .json({
        success: true,
        message: "author updated successfully",
        data: author,
      });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//Web API
const getAuthorProfileById = async (req,res)=>{
  try{
   const id = req.params.authorId;
   console.log(id);
   //get the language from the headers and set the english to default incase nothing is provided
   const language = req.headers['accept-language'] || 'en';
   //validate the language provided
   const validLanguages = ['en','ar'];
   const lang = validLanguages.includes(language) ? language : 'en';
   //get the author by id
   const author = await Author.findById(id);
   if(!author) return res.status(404).json({ success: false, message:"author not found" });
   const response = {
    name : author.name[lang],
    biography : author.biography[lang],
    profileImageUrl : author.profileImageUrl,
    birthDate : author.birthDate

   };
   res.status(200).json({ success: true, data: response });

  }catch(err){
    res.status(500).json({ success: false, message: err.message });
  }
}
module.exports = {
  createAuthor,
  getAuthorById,
  deleteAuthorById,
  updateAuthorById,
  getAuthorProfileById
};
