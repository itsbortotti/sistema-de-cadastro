const { body } = require('express-validator');
const constants = require('../config/constants');
const { handleValidation } = require('./common');

const createRules = [
  body('nome')
    .trim()
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ max: constants.NOME_MAX_LENGTH })
    .withMessage(`Nome deve ter no máximo ${constants.NOME_MAX_LENGTH} caracteres`),
  body('login')
    .trim()
    .notEmpty()
    .withMessage('Login é obrigatório')
    .isLength({ min: constants.LOGIN_MIN_LENGTH, max: constants.LOGIN_MAX_LENGTH })
    .withMessage(`Login deve ter entre ${constants.LOGIN_MIN_LENGTH} e ${constants.LOGIN_MAX_LENGTH} caracteres`),
  body('senha')
    .notEmpty()
    .withMessage('Senha é obrigatória')
    .isLength({ min: 4 })
    .withMessage('Senha deve ter no mínimo 4 caracteres'),
  body('email').optional({ values: 'null' }).trim().isLength({ max: 255 }),
  body('perfilId').optional({ values: 'null' }).trim(),
];

const updateRules = [
  body('nome')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Nome não pode ser vazio')
    .isLength({ max: constants.NOME_MAX_LENGTH })
    .withMessage(`Nome deve ter no máximo ${constants.NOME_MAX_LENGTH} caracteres`),
  body('login')
    .optional()
    .trim()
    .isLength({ min: constants.LOGIN_MIN_LENGTH, max: constants.LOGIN_MAX_LENGTH })
    .withMessage(`Login deve ter entre ${constants.LOGIN_MIN_LENGTH} e ${constants.LOGIN_MAX_LENGTH} caracteres`),
  body('senha')
    .optional()
    .isLength({ min: 4 })
    .withMessage('Senha deve ter no mínimo 4 caracteres'),
  body('email').optional({ values: 'null' }).trim().isLength({ max: 255 }),
  body('perfilId').optional({ values: 'null' }).trim(),
];

function validateCreateUsuario() {
  return [...createRules, handleValidation];
}

function validateUpdateUsuario() {
  return [...updateRules, handleValidation];
}

module.exports = { validateCreateUsuario, validateUpdateUsuario };
