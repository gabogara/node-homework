const Joi = require("joi");

const userIdSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

const searchSchema = Joi.object({
  q: Joi.string().trim().min(2).required(),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

module.exports = {
  userIdSchema,
  paginationSchema,
  searchSchema,
};
