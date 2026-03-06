const { validationResult } = require('express-validator');

/**
 * Middleware que retorna 400 com a primeira mensagem de erro da validação.
 * Uso: após as regras do express-validator, coloque handleValidation antes do handler.
 */
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array({ onlyFirstError: true })[0];
    return res.status(400).json({ erro: first?.msg || 'Dados inválidos' });
  }
  next();
}

module.exports = { handleValidation };
