const express = require('express');
const { listar, getById, criar, atualizar, remover } = require('../data/projetos');
const { getById: getEmpresaById } = require('../data/empresas');
const { getById: getProdutoById } = require('../data/produtosSoftware');

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session?.usuario) return res.status(401).json({ erro: 'Não autenticado' });
  next();
}
router.use(requireAuth);

function expandir(item) {
  const u = { ...item };
  if (item.empresaId) {
    const emp = getEmpresaById(item.empresaId);
    const nome = emp && (emp.nomeFantasia || emp.razaoSocial || String(emp.id).trim());
    u.empresaNome = nome || null;
  }
  if (Array.isArray(item.produtoSoftwareIds) && item.produtoSoftwareIds.length > 0) {
    u.sistemaNomes = item.produtoSoftwareIds
      .map((id) => {
        const p = getProdutoById(id);
        return p ? (p.nomeSistema || p.id) : null;
      })
      .filter(Boolean);
  } else {
    u.sistemaNomes = [];
  }
  return u;
}

router.get('/', (req, res) => {
  const lista = listar().map(expandir);
  res.json(lista);
});

router.get('/:id', (req, res) => {
  const item = getById(req.params.id);
  if (!item) return res.status(404).json({ erro: 'Não encontrado' });
  res.json(expandir(item));
});

router.post('/', (req, res) => {
  const body = req.body || {};
  if (!body.nome || !String(body.nome).trim()) return res.status(400).json({ erro: 'Nome do projeto é obrigatório' });
  const ids = Array.isArray(body.produtoSoftwareIds) ? body.produtoSoftwareIds.map((x) => String(x).trim()).filter(Boolean) : [];
  if (ids.length === 0) return res.status(400).json({ erro: 'O projeto deve estar associado a pelo menos um sistema.' });
  res.status(201).json(criar(body));
});

router.put('/:id', (req, res) => {
  const body = { ...(req.body || {}) };
  const existente = getById(req.params.id);
  if (!existente) return res.status(404).json({ erro: 'Não encontrado' });
  if (body.produtoSoftwareIds === undefined) body.produtoSoftwareIds = existente.produtoSoftwareIds;
  const ids = Array.isArray(body.produtoSoftwareIds) ? body.produtoSoftwareIds.map((x) => String(x).trim()).filter(Boolean) : [];
  if (ids.length === 0) return res.status(400).json({ erro: 'O projeto deve estar associado a pelo menos um sistema.' });
  const item = atualizar(req.params.id, body);
  res.json(expandir(item));
});

router.delete('/:id', (req, res) => {
  if (!remover(req.params.id)) return res.status(404).json({ erro: 'Não encontrado' });
  res.json({ ok: true });
});

module.exports = router;
