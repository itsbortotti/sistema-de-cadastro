const express = require('express');
const { listar, getById, criar, atualizar, remover } = require('../data/formasAcesso');

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session?.usuario) return res.status(401).json({ erro: 'Não autenticado' });
  next();
}
router.use(requireAuth);

/**
 * @swagger
 * /api/formas-acesso:
 *   get:
 *     summary: Lista todas as formas de acesso
 *     tags: [Formas de Acesso]
 *     responses:
 *       200: { description: Lista de formas de acesso }
 */
router.get('/', (req, res) => res.json(listar()));

/**
 * @swagger
 * /api/formas-acesso/{id}:
 *   get:
 *     summary: Busca forma de acesso por ID
 *     tags: [Formas de Acesso]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Forma de acesso encontrada }
 *       404: { description: Não encontrado }
 */
router.get('/:id', (req, res) => {
  const item = getById(req.params.id);
  if (!item) return res.status(404).json({ erro: 'Não encontrado' });
  res.json(item);
});

/**
 * @swagger
 * /api/formas-acesso:
 *   post:
 *     summary: Cria uma nova forma de acesso
 *     tags: [Formas de Acesso]
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
 *               tipo: { type: string }
 *               observacoes: { type: string }
 *     responses:
 *       201: { description: Forma de acesso criada }
 *       400: { description: Nome é obrigatório }
 */
router.post('/', (req, res) => {
  const body = req.body || {};
  if (!body.nome || !String(body.nome).trim()) return res.status(400).json({ erro: 'Nome é obrigatório' });
  res.status(201).json(criar(body));
});

/**
 * @swagger
 * /api/formas-acesso/{id}:
 *   put:
 *     summary: Atualiza uma forma de acesso
 *     tags: [Formas de Acesso]
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
 *               tipo: { type: string }
 *               observacoes: { type: string }
 *     responses:
 *       200: { description: Forma de acesso atualizada }
 *       404: { description: Não encontrado }
 */
router.put('/:id', (req, res) => {
  const item = atualizar(req.params.id, req.body || {});
  if (!item) return res.status(404).json({ erro: 'Não encontrado' });
  res.json(item);
});

/**
 * @swagger
 * /api/formas-acesso/{id}:
 *   delete:
 *     summary: Remove uma forma de acesso
 *     tags: [Formas de Acesso]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Forma de acesso removida }
 *       404: { description: Não encontrado }
 */
router.delete('/:id', (req, res) => {
  if (!remover(req.params.id)) return res.status(404).json({ erro: 'Não encontrado' });
  res.json({ ok: true });
});

module.exports = router;
