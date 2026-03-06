const express = require('express');
const { listar, getById, criar, atualizar, remover } = require('../data/perfis');
const { ENTIDADES } = require('../data/permissoes');
const { registrarLog } = require('../lib/logHelper');
const { validateIdParam } = require('../middleware/validateId');

const router = express.Router();
router.param('id', validateIdParam);

/**
 * @swagger
 * /api/perfis:
 *   get:
 *     summary: Lista todos os perfis (quem pode visualizar perfis)
 *     tags: [Perfis]
 *     responses:
 *       200: { description: Lista de perfis }
 */
router.get('/', async (req, res, next) => {
  try {
    const lista = await listar();
    res.json(lista);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/perfis/entidades:
 *   get:
 *     summary: Lista entidades para matriz de permissões
 *     tags: [Perfis]
 *     responses:
 *       200: { description: Lista de entidades }
 */
router.get('/entidades', (req, res) => res.json(ENTIDADES));

/**
 * @swagger
 * /api/perfis:
 *   post:
 *     summary: Cria um novo perfil
 *     tags: [Perfis]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome: { type: string }
 *     responses:
 *       201: { description: Perfil criado }
 *       400: { description: Nome já existe ou inválido }
 */
router.post('/', async (req, res, next) => {
  try {
    const { nome } = req.body || {};
    if (!nome || !String(nome).trim()) {
      return res.status(400).json({ erro: 'Nome do perfil é obrigatório' });
    }
    const perfil = await criar({ nome: String(nome).trim() });
    if (!perfil) return res.status(400).json({ erro: 'Já existe um perfil com este nome' });
    registrarLog('criacao', `Criou perfil: ${perfil.nome}`, req.session?.usuario?.id).catch(() => {});
    res.status(201).json(perfil);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/perfis/{id}:
 *   get:
 *     summary: Busca perfil por ID com suas permissões
 *     tags: [Perfis]
 */
router.get('/:id', async (req, res, next) => {
  try {
    const perfil = await getById(req.params.id);
    if (!perfil) return res.status(404).json({ erro: 'Perfil não encontrado' });
    res.json(perfil);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/perfis/{id}:
 *   put:
 *     summary: Atualiza perfil (nome e/ou permissões)
 *     tags: [Perfis]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome: { type: string }
 *               permissoes: { type: array, items: { type: object } }
 *     responses:
 *       200: { description: Perfil atualizado }
 *       400: { description: Nome já existe }
 *       404: { description: Perfil não encontrado }
 */
router.put('/:id', async (req, res, next) => {
  try {
    const perfil = await atualizar(req.params.id, req.body || {});
    if (!perfil) {
      const existente = await getById(req.params.id);
      if (!existente) return res.status(404).json({ erro: 'Perfil não encontrado' });
      return res.status(400).json({ erro: 'Já existe um perfil com este nome' });
    }
    registrarLog('edicao', `Editou perfil: ${perfil.nome}`, req.session?.usuario?.id).catch(() => {});
    res.json(perfil);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/perfis/{id}:
 *   delete:
 *     summary: Remove perfil (apenas se não houver usuários vinculados)
 *     tags: [Perfis]
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const p = await getById(req.params.id);
    const ok = await remover(req.params.id);
    if (!ok) {
      if (!p) return res.status(404).json({ erro: 'Perfil não encontrado' });
      return res.status(400).json({ erro: 'Não é possível excluir perfil com usuários vinculados' });
    }
    registrarLog('exclusao', `Excluiu perfil: ${p?.nome || req.params.id}`, req.session?.usuario?.id).catch(() => {});
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
