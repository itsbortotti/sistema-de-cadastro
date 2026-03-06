/**
 * Valida parâmetro :id (CUID ou IDs customizados como perfil-admin: alfanumérico, hífen, underscore).
 * Uso: router.param('id', validateIdParam);
 */
const ID_REGEX = /^[a-z0-9_-]{1,50}$/i;

function validateIdParam(req, res, next, id) {
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ erro: 'ID inválido' });
  }
  const trimmed = id.trim();
  if (!trimmed || !ID_REGEX.test(trimmed)) {
    return res.status(400).json({ erro: 'ID inválido' });
  }
  next();
}

module.exports = { validateIdParam };
