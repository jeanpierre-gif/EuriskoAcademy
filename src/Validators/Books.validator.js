const joi = require("joi");

const bookValidationSchema = joi.object({
  title: joi
    .object({
      en: joi
        .string()
        .pattern(/^[a-zA-Z\s]+$/)
        .required()
        .messages({
          "string.pattern.base": "title is not in english",
          "string.empty": "title in english is required",
        }),
      ar: joi
        .string()
        .pattern(/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s]+$/)
        .required()
        .messages({
          "string.pattern.base": "title is not in arabic",
          "string.empty": "title in arabic is required",
        }),
    })
    .required(),
  isbn: joi
    .string()
    .pattern(/^978-\d{1}-\d{3}-\d{5}-\d{1}$/)
    .required()
    .messages({
      "string.pattern.base": "ISBN must follow the format 978-0-596-52068-7",
    }),
  genre: joi.string().required(),
  description: joi
    .object({
      en: joi.string().required(),
      ar: joi
        .string()
        .required()
        .pattern(/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s]+$/)
        .messages({
          "string.pattern.base": "description is not in arabic",
          "string.empty": "description in arabic is required",
        }),
    })
    .required(),
  numberOfAvailableCopies: joi.number().min(0).default(0),
  isBorrowable: joi.boolean().default(false),
  numberOfBorrowableDays: joi.number().min(0).default(0),
  isOpenToReviews: joi.boolean().default(false),
  minAge: joi.number().min(0).required(),
  authorId: joi.number().required(),
  coverImageUrl: joi.string().uri(),
  publishedDate: joi.date(),
  isPublished: joi.boolean().default(false),
});

module.exports = bookValidationSchema;
