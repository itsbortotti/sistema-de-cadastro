const express = require('express');
const { listar, getById, criar, atualizar, remover } = require('../data/times');

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session?.usuario) return res.status(401).json({ erro: 'Não autenticado' });
  next();
}
router.use(requireAuth);

/**
 * @swagger
 * /api/times:
 *   get:
 *     summary: Lista todos os times
 *     tags: [Times]
 *     responses:
 *       200: { description: Lista de times }
 */
router.get('/', (req, res) => res.json(listar()));

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
router.get('/:id', (req, res) => {
  const item = getById(req.params.id);
  if (!item) return res.status(404).json({ erro: 'Não encontrado' });
  res.json(item);
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
router.post('/', (req, res) => {
  const body = req.body || {};
  if (!body.nome || !String(body.nome).trim()) return res.status(400).json({ erro: 'Nome é obrigatório' });
  res.status(201).json(criar(body));
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
router.put('/:id', (req, res) => {
  const item = atualizar(req.params.id, req.body || {});
  if (!item) return res.status(404).json({ erro: 'Não encontrado' });
  res.json(item);
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
router.delete('/:id', (req, res) => {
  if (!remover(req.params.id)) return res.status(404).json({ erro: 'Não encontrado' });
  res.json({ ok: true });
});

module.exports = router;
