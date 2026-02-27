const { pode } = require('../data/permissoes');
const { getById: getUsuarioById } = require('../data/usuarios');

function requireAuth(req, res, next) {
  if (!req.session?.usuario) {
    return res.status(401).json({ erro: 'Não autenticado' });
  }
  next();
}

function tipoAtual(req) {
  const uid = req.session?.usuario?.id;
  if (!uid) return 'membro';
  const u = getUsuarioById(uid);
  return u?.tipo || req.session?.usuario?.tipo || 'membro';
}

function requirePermissao(entidade, acao) {
  return (req, res, next) => {
    const tipo = tipoAtual(req);
    if (pode(tipo, entidade, acao)) return next();
    return res.status(403).json({ erro: 'Sem permissão para esta ação' });
  };
}

function requirePermissaoPorMetodo(entidade) {
  return (req, res, next) => {
    const tipo = tipoAtual(req);
    if (tipo === 'admin') return next();
    let acao = 'visualizar';
    if (req.method === 'POST') acao = 'criar';
    else if (req.method === 'PUT' || req.method === 'PATCH') acao = 'editar';
    else if (req.method === 'DELETE') acao = 'excluir';
    if (pode(tipo, entidade, acao)) return next();
    return res.status(403).json({ erro: 'Sem permissão para esta ação' });
  };
}

module.exports = { requireAuth, requirePermissao, requirePermissaoPorMetodo };
