const { pode } = require('../data/permissoes');
const { getById: getUsuarioById } = require('../data/usuarios');

function requireAuth(req, res, next) {
  if (!req.session?.usuario) {
    return res.status(401).json({ erro: 'Não autenticado' });
  }
  next();
}

async function perfilIdAtual(req) {
  const uid = req.session?.usuario?.id;
  if (!uid) return null;
  const u = await getUsuarioById(uid);
  return u?.perfilId || req.session?.usuario?.perfilId || null;
}

function requirePermissao(entidade, acao) {
  return async (req, res, next) => {
    const perfilId = await perfilIdAtual(req);
    if (!perfilId) return res.status(403).json({ erro: 'Você não tem permissão para realizar esta ação.' });
    const permitido = await pode(perfilId, entidade, acao);
    if (permitido) return next();
    return res.status(403).json({ erro: 'Você não tem permissão para realizar esta ação.' });
  };
}

function requirePermissaoPorMetodo(entidade) {
  return async (req, res, next) => {
    const perfilId = await perfilIdAtual(req);
    if (!perfilId) return res.status(403).json({ erro: 'Você não tem permissão para realizar esta ação.' });
    let acao = 'visualizar';
    if (req.method === 'POST') acao = 'criar';
    else if (req.method === 'PUT' || req.method === 'PATCH') acao = 'editar';
    else if (req.method === 'DELETE') acao = 'excluir';
    const permitido = await pode(perfilId, entidade, acao);
    if (permitido) return next();
    return res.status(403).json({ erro: 'Você não tem permissão para realizar esta ação.' });
  };
}

module.exports = { requireAuth, requirePermissao, requirePermissaoPorMetodo };
