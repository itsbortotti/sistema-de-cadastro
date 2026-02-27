const express = require('express');
const { listar, getById, criar, atualizar, remover } = require('../data/fornecedores');

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session?.usuario) return res.status(401).json({ erro: 'Não autenticado' });
  next();
}
router.use(requireAuth);

/**
 * @swagger
 * /api/fornecedores:
 *   get:
 *     summary: Lista todos os fornecedores
 *     tags: [Fornecedores]
 *     responses:
 *       200: { description: Lista de fornecedores }
 */
router.get('/', (req, res) => res.json(listar()));

/**
 * @swagger
 * /api/fornecedores/{id}:
 *   get:
 *     summary: Busca fornecedor por ID
 *     tags: [Fornecedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Fornecedor encontrado }
 *       404: { description: Não encontrado }
 */
router.get('/:id', (req, res) => {
  const item = getById(req.params.id);
  if (!item) return res.status(404).json({ erro: 'Não encontrado' });
  res.json(item);
});

/**
 * @swagger
 * /api/fornecedores:
 *   post:
 *     summary: Cria um novo fornecedor
 *     tags: [Fornecedores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome]
 *             properties:
 *               nome: { type: string }
 *               razaoSocial: { type: string }
 *               nomeFantasia: { type: string }
 *               cnpj: { type: string }
 *               cpf: { type: string }
 *               email: { type: string }
 *               telefone: { type: string }
 *               celular: { type: string }
 *               endereco: { type: string }
 *               numero: { type: string }
 *               complemento: { type: string }
 *               bairro: { type: string }
 *               cidade: { type: string }
 *               estado: { type: string }
 *               cep: { type: string }
 *               site: { type: string }
 *               contato: { type: string }
 *               observacoes: { type: string }
 *     responses:
 *       201: { description: Fornecedor criado }
 *       400: { description: Nome é obrigatório }
 */
router.post('/', (req, res) => {
  const body = req.body || {};
  if (!body.nome || !String(body.nome).trim()) return res.status(400).json({ erro: 'Nome é obrigatório' });
  res.status(201).json(criar(body));
});

/**
 * @swagger
 * /api/fornecedores/{id}:
 *   put:
 *     summary: Atualiza um fornecedor
 *     tags: [Fornecedores]
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
 *               razaoSocial: { type: string }
 *               nomeFantasia: { type: string }
 *               cnpj: { type: string }
 *               cpf: { type: string }
 *               email: { type: string }
 *               telefone: { type: string }
 *               celular: { type: string }
 *               endereco: { type: string }
 *               numero: { type: string }
 *               complemento: { type: string }
 *               bairro: { type: string }
 *               cidade: { type: string }
 *               estado: { type: string }
 *               cep: { type: string }
 *               site: { type: string }
 *               contato: { type: string }
 *               observacoes: { type: string }
 *     responses:
 *       200: { description: Fornecedor atualizado }
 *       404: { description: Não encontrado }
 */
router.put('/:id', (req, res) => {
  const item = atualizar(req.params.id, req.body || {});
  if (!item) return res.status(404).json({ erro: 'Não encontrado' });
  res.json(item);
});

/**
 * @swagger
 * /api/fornecedores/{id}:
 *   delete:
 *     summary: Remove um fornecedor
 *     tags: [Fornecedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Fornecedor removido }
 *       404: { description: Não encontrado }
 */
router.delete('/:id', (req, res) => {
  if (!remover(req.params.id)) return res.status(404).json({ erro: 'Não encontrado' });
  res.json({ ok: true });
});

module.exports = router;
