const express = require('express');
const { listar, getById, criar, atualizar, remover } = require('../data/fornecedores');
const { validateIdParam } = require('../middleware/validateId');

const router = express.Router();
router.param('id', validateIdParam);

/**
 * @swagger
 * /api/fornecedores:
 *   get:
 *     summary: Lista todos os fornecedores
 *     tags: [Fornecedores]
 *     responses:
 *       200: { description: Lista de fornecedores }
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
router.get('/:id', async (req, res, next) => {
  try {
    const item = await getById(req.params.id);
    if (!item) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(item);
  } catch (err) {
    next(err);
  }
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
router.post('/', async (req, res, next) => {
  try {
    const body = req.body || {};
    if (!body.nome || !String(body.nome).trim()) return res.status(400).json({ erro: 'Nome é obrigatório' });
    const item = await criar(body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
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
router.put('/:id', async (req, res, next) => {
  try {
    const item = await atualizar(req.params.id, req.body || {});
    if (!item) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(item);
  } catch (err) {
    next(err);
  }
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
router.delete('/:id', async (req, res, next) => {
  try {
    if (!(await remover(req.params.id))) return res.status(404).json({ erro: 'Não encontrado' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
