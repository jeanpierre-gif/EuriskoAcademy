const AuthorService = require("./Authors.service");

class AuthorController {
  //CMS APIs
  createAuthor = async (req, res) => {
    try {
      const author = await AuthorService.createAuthor(req, res);
      res.status(200).json({ success: true, data: author });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, message: err.message, details: err.details });
    }
  };

  //get author by id
  getAuthorById = async (req, res) => {
    try {
      const author = await AuthorService.getAuthorById(req, res);
      res.status(200).json({ success: true, data: author });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  //delete author by id
  deleteAuthorById = async (req, res) => {
    try {
      const message = await AuthorService.deleteAuthorById(req, res);
      res.status(200).json({ success: true, message: message });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  //update the author details by id,only modifying the provided fields
  updateAuthorById = async (req, res) => {
    try {
      const author = await AuthorService.updateAuthorById(req, res);
      res
        .status(200)
        .json({
          success: true,
          message: "author updated successfully",
          data: author,
        });
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ success: false, message: err.message, details: err.details });
    }
  };

  //Web API
  getAuthorProfileById = async (req, res) => {
    try {
      const authorProfile = await AuthorService.getAuthorProfileById(req, res);
      res.status(200).json({ success: true, data: authorProfile });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
}

module.exports = new AuthorController();
