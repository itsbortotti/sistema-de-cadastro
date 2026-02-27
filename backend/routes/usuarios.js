const express = require('express');
const {
  getUsuarios,
  getById,
  getByLogin,
  criar,
  atualizar,
  remover,
} = require('../data/usuarios');

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session?.usuario) {
    return res.status(401).json({ erro: 'Não autenticado' });
  }
  next();
}

router.use(requireAuth);

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Usuários]
 *     responses:
 *       200: { description: Lista de usuários }
 */
router.get('/', (req, res) => {
  const lista = getUsuarios().map(({ senhaHash, ...u }) => ({
    ...u,
    tipo: u.tipo || 'membro',
    email: u.email || '',
  }));
  res.json(lista);
});

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Busca usuário por ID
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Usuário encontrado }
 *       404: { description: Não encontrado }
 */
router.get('/:id', (req, res) => {
  const u = getById(req.params.id);
  if (!u) return res.status(404).json({ erro: 'Usuário não encontrado' });
  const { senhaHash, ...rest } = u;
  res.json({ ...rest, tipo: rest.tipo || 'membro', email: rest.email || '' });
});

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Usuários]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, login, senha]
 *             properties:
 *               nome: { type: string }
 *               login: { type: string }
 *               email: { type: string }
 *               senha: { type: string }
 *               tipo: { type: string, enum: [admin, membro, visualizacao] }
 *     responses:
 *       201: { description: Usuário criado }
 *       400: { description: Dados inválidos }
 */
router.post('/', (req, res) => {
  const { nome, login, email, senha, tipo } = req.body || {};
  if (!nome || !login || !senha) {
    return res.status(400).json({ erro: 'Nome, login e senha são obrigatórios' });
  }
  if (getByLogin(login)) {
    return res.status(400).json({ erro: 'Login já em uso' });
  }
  const usuario = criar({ nome, login, email, senha, tipo });
  res.status(201).json(usuario);
});

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Atualiza um usuário
 *     tags: [Usuários]
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
 *               login: { type: string }
 *               email: { type: string }
 *               senha: { type: string }
 *               tipo: { type: string, enum: [admin, membro, visualizacao] }
 *     responses:
 *       200: { description: Usuário atualizado }
 *       400: { description: Dados inválidos }
 *       404: { description: Não encontrado }
 */
router.put('/:id', (req, res) => {
  const { nome, login, email, senha, tipo } = req.body || {};
  if (getByLogin(login, req.params.id)) {
    return res.status(400).json({ erro: 'Login já em uso' });
  }
  const usuario = atualizar(req.params.id, { nome, login, email, senha, tipo });
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
  res.json(usuario);
});

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Remove um usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Usuário removido }
 *       404: { description: Não encontrado }
 */
router.delete('/:id', (req, res) => {
  if (!remover(req.params.id)) {
    return res.status(404).json({ erro: 'Usuário não encontrado' });
  }
  res.json({ ok: true });
});

module.exports = router;
