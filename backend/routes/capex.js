const express = require('express');
const { listar, getById, criar, atualizar, remover } = require('../data/capex');
const { getById: getAreaById } = require('../data/areas');
const { getById: getFornecedorById } = require('../data/fornecedores');
const { getById: getProdutoById } = require('../data/produtosSoftware');
const { getById: getProjetoById } = require('../data/projetos');

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session?.usuario) return res.status(401).json({ erro: 'Não autenticado' });
  next();
}
router.use(requireAuth);

function expandir(item) {
  const u = { ...item };
  if (item.areaId) {
    const a = getAreaById(item.areaId);
    u.areaNome = a ? a.nome : null;
  }
  if (item.fornecedorId) {
    const f = getFornecedorById(item.fornecedorId);
    u.fornecedorNome = f ? f.nome : null;
  }
  const prodIds = item.produtoSoftwareIds || [];
  u.produtoSoftwareNomes = prodIds.map((pid) => {
    const p = getProdutoById(pid);
    return p ? (p.nomeSistema || p.id) : pid;
  });
  const projIds = item.projetoIds || [];
  u.projetoNomes = projIds.map((pid) => {
    const p = getProjetoById(pid);
    return p ? (p.nome || pid) : pid;
  });
  return u;
}

/**
 * @swagger
 * /api/capex:
 *   get:
 *     summary: Lista todos os registros de Capex
 *     tags: [Capex]
 *     responses:
 *       200: { description: Lista com areaNome e fornecedorNome expandidos }
 */
router.get('/', (req, res) => {
  const lista = listar().map(expandir);
  res.json(lista);
});

/**
 * @swagger
 * /api/capex/{id}:
 *   get:
 *     summary: Busca Capex por ID
 *     tags: [Capex]
 */
router.get('/:id', (req, res) => {
  const item = getById(req.params.id);
  if (!item) return res.status(404).json({ erro: 'Não encontrado' });
  res.json(expandir(item));
});

/**
 * @swagger
 * /api/capex:
 *   post:
 *     summary: Cria um novo Capex
 *     tags: [Capex]
 */
router.post('/', (req, res) => {
  const body = req.body || {};
  if (body.areaId == null || body.areaId === '') return res.status(400).json({ erro: 'Área é obrigatória' });
  if (body.valor == null || body.valor === '' || isNaN(Number(body.valor))) return res.status(400).json({ erro: 'Valor é obrigatório e deve ser um número' });
  res.status(201).json(criar(body));
});

/**
 * @swagger
 * /api/capex/{id}:
 *   put:
 *     summary: Atualiza um Capex
 *     tags: [Capex]
 */
router.put('/:id', (req, res) => {
  try {
    const item = atualizar(req.params.id, req.body || {});
    if (!item) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(expandir(item));
  } catch (err) {
    return res.status(400).json({ erro: err.message || 'Dados inválidos' });
  }
});

/**
 * @swagger
 * /api/capex/{id}:
 *   delete:
 *     summary: Remove um Capex
 *     tags: [Capex]
 */
router.delete('/:id', (req, res) => {
  if (!remover(req.params.id)) return res.status(404).json({ erro: 'Não encontrado' });
  res.json({ ok: true });
});

module.exports = router;
