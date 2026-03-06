const express = require('express');
const { listar, getById, criar, atualizar, remover } = require('../data/capex');
const { getById: getAreaById } = require('../data/areas');
const { getById: getFornecedorById } = require('../data/fornecedores');
const { getById: getProdutoById } = require('../data/produtosSoftware');
const { getById: getProjetoById } = require('../data/projetos');
const { validateIdParam } = require('../middleware/validateId');

const router = express.Router();
router.param('id', validateIdParam);

async function expandir(item) {
  const u = { ...item };
  if (item.areaId) {
    const a = await getAreaById(item.areaId);
    u.areaNome = a ? a.nome : null;
  }
  if (item.fornecedorId) {
    const f = await getFornecedorById(item.fornecedorId);
    u.fornecedorNome = f ? f.nome : null;
  }
  const prodIds = item.produtoSoftwareIds || [];
  u.produtoSoftwareNomes = await Promise.all(prodIds.map(async (pid) => {
    const p = await getProdutoById(pid);
    return p ? (p.nomeSistema || p.id) : pid;
  }));
  const projIds = item.projetoIds || [];
  u.projetoNomes = await Promise.all(projIds.map(async (pid) => {
    const p = await getProjetoById(pid);
    return p ? (p.nome || pid) : pid;
  }));
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
router.get('/', async (req, res, next) => {
  try {
    const lista = await listar();
    const expanded = await Promise.all(lista.map(expandir));
    res.json(expanded);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/capex/{id}:
 *   get:
 *     summary: Busca Capex por ID
 *     tags: [Capex]
 */
router.get('/:id', async (req, res, next) => {
  try {
    const item = await getById(req.params.id);
    if (!item) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(await expandir(item));
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/capex:
 *   post:
 *     summary: Cria um novo Capex
 *     tags: [Capex]
 */
router.post('/', async (req, res, next) => {
  try {
    const body = req.body || {};
    if (body.areaId == null || body.areaId === '') return res.status(400).json({ erro: 'Área é obrigatória' });
    if (body.valor == null || body.valor === '' || isNaN(Number(body.valor))) return res.status(400).json({ erro: 'Valor é obrigatório e deve ser um número' });
    const classificacao = body.classificacao || 'capex';
    const projetoIds = Array.isArray(body.projetoIds) ? body.projetoIds.filter((id) => id != null && String(id).trim()) : [];
    const produtoSoftwareIds = Array.isArray(body.produtoSoftwareIds) ? body.produtoSoftwareIds.filter((id) => id != null && String(id).trim()) : [];
    if (classificacao === 'capex' && projetoIds.length === 0) return res.status(400).json({ erro: 'O Capex deve estar associado a pelo menos um projeto.' });
    if (classificacao === 'opex' && produtoSoftwareIds.length === 0) return res.status(400).json({ erro: 'O Opex deve estar associado a pelo menos um sistema.' });
    res.status(201).json(await criar(body));
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/capex/{id}:
 *   put:
 *     summary: Atualiza um Capex
 *     tags: [Capex]
 */
router.put('/:id', async (req, res, next) => {
  try {
    const body = req.body || {};
    const existente = await getById(req.params.id);
    if (!existente) return res.status(404).json({ erro: 'Não encontrado' });
    const classificacao = body.classificacao ?? existente.classificacao ?? 'capex';
    const projetoIds = body.projetoIds !== undefined
      ? (Array.isArray(body.projetoIds) ? body.projetoIds.filter((id) => id != null && String(id).trim()) : [])
      : (existente.projetoIds || []);
    const produtoSoftwareIds = body.produtoSoftwareIds !== undefined
      ? (Array.isArray(body.produtoSoftwareIds) ? body.produtoSoftwareIds.filter((id) => id != null && String(id).trim()) : [])
      : (existente.produtoSoftwareIds || []);
    if (classificacao === 'capex' && projetoIds.length === 0) return res.status(400).json({ erro: 'O Capex deve estar associado a pelo menos um projeto.' });
    if (classificacao === 'opex' && produtoSoftwareIds.length === 0) return res.status(400).json({ erro: 'O Opex deve estar associado a pelo menos um sistema.' });
    const item = await atualizar(req.params.id, body);
    res.json(await expandir(item));
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/capex/{id}:
 *   delete:
 *     summary: Remove um Capex
 *     tags: [Capex]
 */
router.delete('/:id', async (req, res, next) => {
  try {
    if (!(await remover(req.params.id))) return res.status(404).json({ erro: 'Não encontrado' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
