const Author = require("./Authors.model");
const AuthorValidationSchema = require("../Validators/Authors.validator");

class AuthorService{
//CMS APIs
 createAuthor = async (req, res) => {
  const { error, value } = AuthorValidationSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    const errorMessages = error.details.map((err) => err.message);
    console.log(errorMessages);
    throw {
      statusCode: 400,
      message: "Validation error",
      details: errorMessages,
    };
  }
  const existingEmail = await Author.findOne({ email: value.email });
  if (existingEmail) {
    throw { statusCode: 400, message: "author with this email already exists" };
  }
  const profileImageUrl = req.file;
  const author = new Author({
    ...value,
    profileImageUrl: profileImageUrl ? profileImageUrl.filename : null,
  });
  console.log(author);
  await author.save();
  return author;
};

//get author by id
 getAuthorById = async (req, res) => {
  const id = req.query["author-id"];
  if (!id || id.trim() === "") {
    throw { statusCode: 400, message: "Missing or invalid author-id" };
  }
  const authorfound = await Author.findById(id);
  if (!authorfound) {
    throw { statusCode: 404, message: "Author not found" };
  }
  return authorfound;
};

//delete author by id
 deleteAuthorById = async (req, res) => {
  const id = req.query["author-id"];
  if (!id || id.trim() === "") {
    throw { statusCode: 400, message: "Missing or invalid author-id" };
  }
  const authorDeleted = await Author.findByIdAndDelete(id);
  if (!authorDeleted) {
    throw { statusCode: 404, message: "author not found" };
  }
  return "author deleted";
};

//update the author details by id,only modifying the provided fields
 updateAuthorById = async (req, res) => {
  const id = req.query["author-id"];
  if (!id || id.trim() === "") {
    throw { statusCode: 400, message: "Missing or invalid author-id" };
  }

  //get the existing author from the database
  const author = await Author.findById(id);
  if (!author) {
    throw { statusCode: 404, message: "Author not found" };
  }

  //merge the existing author data with the new data from the req
  const updates = req.body;
  const profileImageUrl = req.file;
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
    throw {
      statusCode: 400,
      message: "Validation error",
      details: error.details.map((err) => err.message),
    };
  }

  //check if the email is already in use by another author
  const existingEmail = await Author.findOne({ email: value.email });
  if (existingEmail && existingEmail._id.toString() !== id) {
    throw { statusCode: 400, message: "An author with this email already exists" };
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
  return author;
};

//Web API
 getAuthorProfileById = async (req, res) => {
  const id = req.params.authorId;
  const language = req.headers["accept-language"] || "en";
  const validLanguages = ["en", "ar"];
  const lang = validLanguages.includes(language) ? language : "en";
  const author = await Author.findById(id);
  if (!author) {
    throw { statusCode: 404, message: "author not found" };
  }
  const response = {
    name: author.name[lang],
    biography: author.biography[lang],
    profileImageUrl: author.profileImageUrl,
    birthDate: author.birthDate,
  };
  return response;
};
}
module.exports = new AuthorService();