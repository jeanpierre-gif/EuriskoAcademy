const joi = require("joi");

const AuthorValidationSchema = joi.object({
  name: joi.object({
    en: joi
      .string()
      .pattern(/^[a-zA-Z\s]+$/)
      .required()
      .messages({
        "string.pattern.base": "name is not in english",
        "string.empty": "name in english is required",
      }),
    ar: joi
      .string()
      .pattern(/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s]+$/)
      .required()
      .messages({
        "string.pattern.base": "name is not in arabic",
        "string.empty": "name in arabic is required",
      }),
  }),
  email: joi.string().email().required(),
  biography: joi.object({
    en: joi
      .string()
      .pattern(/^[a-zA-Z\s]+$/)
      .required()
      .messages({
        "string.pattern.base": "biography is not in english",
        "string.empty": "biography in english is required",
      }),
    ar: joi
      .string()
      .pattern(/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s]+$/)
      .required()
      .messages({
        "string.pattern.base": "biography is not in arabic",
        "string.empty": "biography in arabic is required",
      }),
  }),
  profileImageUrl: joi
    .string()
    .pattern(/\.(jpg|jpeg|png|gif)$/i)
    ,
  birthDate: joi.date(),
});
module.exports = AuthorValidationSchema;
