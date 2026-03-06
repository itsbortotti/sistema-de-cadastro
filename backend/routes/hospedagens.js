const express = require('express');
const { listar, getById, criar, atualizar, remover } = require('../data/hospedagens');
const { validateIdParam } = require('../middleware/validateId');

const router = express.Router();
router.param('id', validateIdParam);

/**
 * @swagger
 * /api/hospedagens:
 *   get:
 *     summary: Lista todas as hospedagens
 *     tags: [Hospedagens]
 *     responses:
 *       200: { description: Lista de hospedagens }
 */
router.get('/', async (req, res, next) => {
  try { res.json(await listar()); } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/hospedagens/{id}:
 *   get:
 *     summary: Busca hospedagem por ID
 *     tags: [Hospedagens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Hospedagem encontrada }
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
 * /api/hospedagens:
 *   post:
 *     summary: Cria uma nova hospedagem
 *     tags: [Hospedagens]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome]
 *             properties:
 *               nome: { type: string }
 *               tipo: { type: string }
 *               provedor: { type: string }
 *               descricao: { type: string }
 *               observacoes: { type: string }
 *     responses:
 *       201: { description: Hospedagem criada }
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
 * /api/hospedagens/{id}:
 *   put:
 *     summary: Atualiza uma hospedagem
 *     tags: [Hospedagens]
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
 *               tipo: { type: string }
 *               provedor: { type: string }
 *               descricao: { type: string }
 *               observacoes: { type: string }
 *     responses:
 *       200: { description: Hospedagem atualizada }
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
 * /api/hospedagens/{id}:
 *   delete:
 *     summary: Remove uma hospedagem
 *     tags: [Hospedagens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Hospedagem removida }
 *       404: { description: Não encontrado }
 */
router.delete('/:id', async (req, res, next) => {
  try {
    if (!(await remover(req.params.id))) return res.status(404).json({ erro: 'Não encontrado' });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
