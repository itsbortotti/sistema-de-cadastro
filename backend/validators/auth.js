const { body } = require('express-validator');
const { handleValidation } = require('./common');

const loginRules = [
  body('login')
    .trim()
    .notEmpty()
    .withMessage('Login é obrigatório'),
  body('senha')
    .notEmpty()
    .withMessage('Senha é obrigatória'),
];

function validateLogin() {
  return [...loginRules, handleValidation];
}

module.exports = { validateLogin };
