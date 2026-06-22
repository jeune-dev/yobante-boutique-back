const { body } = require('express-validator');

const registerRules = [
  body('nom').trim().notEmpty().withMessage('Nom requis'),
  body('prenom').trim().notEmpty().withMessage('Prénom requis'),
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 8 }).withMessage('Mot de passe : 8 caractères minimum'),
  body('role').optional().isIn(['client', 'vendeur']).withMessage('Rôle invalide'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis'),
];

const forgotPasswordRules = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
];

const resetPasswordRules = [
  body('token').notEmpty().withMessage('Token requis'),
  body('password').isLength({ min: 8 }).withMessage('Mot de passe : 8 caractères minimum'),
];

const changePasswordRules = [
  body('ancienPassword').notEmpty().withMessage('Ancien mot de passe requis'),
  body('nouveauPassword').isLength({ min: 8 }).withMessage('Nouveau mot de passe : 8 caractères minimum'),
];

module.exports = { registerRules, loginRules, forgotPasswordRules, resetPasswordRules, changePasswordRules };
