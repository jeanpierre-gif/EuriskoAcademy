const express = require("express");
const {
  createAuthor,
  getAuthorById,
  deleteAuthorById,
  updateAuthorById,
} = require("./Authors.controller");
const uploadPicture = require("../config/Multer.config");

const router = express.Router();

router.post("/add-author",uploadPicture.single("profileImageUrl"),createAuthor);
router.get("/get-author-by-id", getAuthorById);
router.delete("/delete-author", deleteAuthorById);
router.patch("/update-author",uploadPicture.single("profileImageUrl"),updateAuthorById);
module.exports = router;
