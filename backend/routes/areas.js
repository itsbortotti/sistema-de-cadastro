const express = require('express');
const { listar, getById, criar, atualizar, remover } = require('../data/areas');

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session?.usuario) return res.status(401).json({ erro: 'Não autenticado' });
  next();
}
router.use(requireAuth);

/**
 * @swagger
 * /api/areas:
 *   get:
 *     summary: Lista todas as áreas
 *     tags: [Áreas]
 *     responses:
 *       200: { description: Lista de áreas }
 */
router.get('/', (req, res) => res.json(listar()));

/**
 * @swagger
 * /api/areas/{id}:
 *   get:
 *     summary: Busca área por ID
 *     tags: [Áreas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Área encontrada }
 *       404: { description: Não encontrado }
 */
router.get('/:id', (req, res) => {
  const item = getById(req.params.id);
  if (!item) return res.status(404).json({ erro: 'Não encontrado' });
  res.json(item);
});

/**
 * @swagger
 * /api/areas:
 *   post:
 *     summary: Cria uma nova área
 *     tags: [Áreas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome]
 *             properties:
 *               nome: { type: string }
 *               codigo: { type: string }
 *               descricao: { type: string }
 *               responsavel: { type: string }
 *               observacoes: { type: string }
 *     responses:
 *       201: { description: Área criada }
 *       400: { description: Nome é obrigatório }
 */
router.post('/', (req, res) => {
  const body = req.body || {};
  if (!body.nome || !String(body.nome).trim()) return res.status(400).json({ erro: 'Nome é obrigatório' });
  res.status(201).json(criar(body));
});

/**
 * @swagger
 * /api/areas/{id}:
 *   put:
 *     summary: Atualiza uma área
 *     tags: [Áreas]
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
 *               codigo: { type: string }
 *               descricao: { type: string }
 *               responsavel: { type: string }
 *               observacoes: { type: string }
 *     responses:
 *       200: { description: Área atualizada }
 *       404: { description: Não encontrado }
 */
router.put('/:id', (req, res) => {
  const item = atualizar(req.params.id, req.body || {});
  if (!item) return res.status(404).json({ erro: 'Não encontrado' });
  res.json(item);
});

/**
 * @swagger
 * /api/areas/{id}:
 *   delete:
 *     summary: Remove uma área
 *     tags: [Áreas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Área removida }
 *       404: { description: Não encontrado }
 */
router.delete('/:id', (req, res) => {
  if (!remover(req.params.id)) return res.status(404).json({ erro: 'Não encontrado' });
  res.json({ ok: true });
});

module.exports = router;
