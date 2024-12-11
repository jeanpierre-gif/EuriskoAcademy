const Joi = require('joi');

// Schema for creating a member (all required)
const memberValidationSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Name is required',
  }),
  username: Joi.string().required().messages({
    'string.empty': 'Username is required',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address',
  }),
  birthDate: Joi.date().required().messages({
    'date.base': 'BirthDate must be a valid date',
    'any.required': 'BirthDate is required',
  }),
  subscribedBooks: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).messages({
    'string.pattern.base': 'SubscribedBooks must contain valid ObjectIds',
  }),
});

// Schema for updating a member (all optional)
const updateMemberValidationSchema = Joi.object({
  name: Joi.string().messages({
    'string.empty': 'Name must be a string',
  }),
  username: Joi.string().messages({
    'string.empty': 'Username must be a string',
  }),
  email: Joi.string().email().messages({
    'string.email': 'Email must be a valid email address',
  }),
  birthDate: Joi.date().messages({
    'date.base': 'BirthDate must be a valid date',
  }),
  subscribedBooks: Joi.array()
  .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('SubscribedBooks must contain valid ObjectIds'))
  .messages({
    'array.base': 'SubscribedBooks must be an array',
  }),
});

module.exports = { memberValidationSchema, updateMemberValidationSchema };
