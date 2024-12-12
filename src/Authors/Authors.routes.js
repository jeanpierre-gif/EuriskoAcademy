const express = require("express");
const AuthorController = require("./Authors.controller");
const uploadPicture = require("../Middlewares/MulterMiddleware");

const router = express.Router();

router.post("/add-author",uploadPicture.single("profileImageUrl"),AuthorController.createAuthor);
router.get("/get-author-by-id", AuthorController.getAuthorById);
router.delete("/delete-author", AuthorController.deleteAuthorById);
router.patch("/update-author",uploadPicture.single("profileImageUrl"),AuthorController.updateAuthorById);
//web api route
router.get("/get-author-profile/:authorId",AuthorController.getAuthorProfileById);
module.exports = router;
