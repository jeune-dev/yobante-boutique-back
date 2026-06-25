const Joi = require('joi');

const registerSchema = Joi.object({
  nom: Joi.string().trim().required(),
  prenom: Joi.string().trim().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/(?=.*[A-Z])(?=.*[0-9])/).required(),
  telephone: Joi.string().trim().optional().allow('', null),
});

const verifyEmailSchema = Joi.object({
  userId: Joi.number().integer().optional(),
  email: Joi.string().email().optional(),
  code: Joi.string().length(6).required(),
}).xor('userId', 'email');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  userId: Joi.number().integer().optional(),
  email: Joi.string().email().optional(),
  code: Joi.string().length(6).required(),
  newPassword: Joi.string().min(8).pattern(/(?=.*[A-Z])(?=.*[0-9])/).required(),
}).xor('userId', 'email');

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).pattern(/(?=.*[A-Z])(?=.*[0-9])/).required(),
});

module.exports = {
  registerSchema,
  verifyEmailSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
};
