const express = require('express');
const { listar, getById, criar, atualizar, remover } = require('../data/projetos');
const { getById: getEmpresaById } = require('../data/empresas');

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
  res.status(201).json(criar(body));
});

router.put('/:id', (req, res) => {
  const item = atualizar(req.params.id, req.body || {});
  if (!item) return res.status(404).json({ erro: 'Não encontrado' });
  res.json(expandir(item));
});

router.delete('/:id', (req, res) => {
  if (!remover(req.params.id)) return res.status(404).json({ erro: 'Não encontrado' });
  res.json({ ok: true });
});

module.exports = router;
