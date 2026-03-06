/**
 * Middleware global de erro: padroniza resposta e log.
 * Rotas devem usar next(err) em vez de res.status(500).json(...).
 */
function errorHandler(err, req, res, _next) {
  const status = err.status ?? err.statusCode ?? 500;
  const message = err.message && status >= 500 ? 'Erro interno do servidor' : (err.message || 'Erro interno do servidor');
  if (status >= 500) {
    console.error('[errorHandler]', err);
  }
  res.status(status).json({ erro: message });
}

module.exports = { errorHandler };
