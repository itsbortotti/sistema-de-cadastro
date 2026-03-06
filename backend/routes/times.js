const express = require('express');
const { listar, getById, criar, atualizar, remover } = require('../data/times');
const { validateIdParam } = require('../middleware/validateId');

const router = express.Router();
router.param('id', validateIdParam);

/**
 * @swagger
 * /api/times:
 *   get:
 *     summary: Lista todos os times
 *     tags: [Times]
 *     responses:
 *       200: { description: Lista de times }
 */
router.get('/', async (req, res, next) => {
  try { res.json(await listar()); } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/times/{id}:
 *   get:
 *     summary: Busca time por ID
 *     tags: [Times]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Time encontrado }
 *       404: { description: Não encontrado }
 */
router.get('/:id', async (req, res, next) => {
  try {
    const item = await getById(req.params.id);
    if (!item) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(item);
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/times:
 *   post:
 *     summary: Cria um novo time
 *     tags: [Times]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome]
 *             properties:
 *               nome: { type: string }
 *               descricao: { type: string }
 *               lider: { type: string }
 *               email: { type: string }
 *               observacoes: { type: string }
 *     responses:
 *       201: { description: Time criado }
 *       400: { description: Nome é obrigatório }
 */
router.post('/', async (req, res, next) => {
  try {
    const body = req.body || {};
    if (!body.nome || !String(body.nome).trim()) return res.status(400).json({ erro: 'Nome é obrigatório' });
    res.status(201).json(await criar(body));
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/times/{id}:
 *   put:
 *     summary: Atualiza um time
 *     tags: [Times]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome: { type: string }
 *               descricao: { type: string }
 *               lider: { type: string }
 *               email: { type: string }
 *               observacoes: { type: string }
 *     responses:
 *       200: { description: Time atualizado }
 *       404: { description: Não encontrado }
 */
router.put('/:id', async (req, res, next) => {
  try {
    const item = await atualizar(req.params.id, req.body || {});
    if (!item) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(item);
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/times/{id}:
 *   delete:
 *     summary: Remove um time
 *     tags: [Times]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Time removido }
 *       404: { description: Não encontrado }
 */
router.delete('/:id', async (req, res, next) => {
  try {
    if (!(await remover(req.params.id))) return res.status(404).json({ erro: 'Não encontrado' });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
