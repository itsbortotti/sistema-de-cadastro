const express = require('express');
const {
  getUsuarios,
  getById,
  getByLogin,
  criar,
  atualizar,
  remover,
} = require('../data/usuarios');
const { registrarLog } = require('../lib/logHelper');
const { validateCreateUsuario, validateUpdateUsuario } = require('../validators/usuarios');
const { validateIdParam } = require('../middleware/validateId');

const router = express.Router();
router.param('id', validateIdParam);

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Usuários]
 *     responses:
 *       200: { description: Lista de usuários }
 */
router.get('/', async (req, res, next) => {
  try {
    const lista = await getUsuarios();
    res.json(lista);
  } catch (err) {
    next(err);
  }
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
router.get('/:id', async (req, res, next) => {
  try {
    const u = await getById(req.params.id);
    if (!u) return res.status(404).json({ erro: 'Usuário não encontrado' });
    const { senhaHash, ...rest } = u;
    res.json({ ...rest, tipo: rest.tipo || 'membro', perfilId: rest.perfilId, perfilNome: rest.perfilNome, email: rest.email || '' });
  } catch (err) {
    next(err);
  }
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
router.post('/', validateCreateUsuario(), async (req, res, next) => {
  try {
    const { nome, login, email, senha, perfilId } = req.body;
    if (await getByLogin(login)) {
      return res.status(400).json({ erro: 'Login já em uso' });
    }
    const usuario = await criar({ nome, login, email, senha, perfilId });
    registrarLog('criacao', `Criou usuário: ${usuario.nome} (${usuario.login})`, req.session?.usuario?.id).catch(() => {});
    res.status(201).json(usuario);
  } catch (err) {
    next(err);
  }
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
router.put('/:id', validateUpdateUsuario(), async (req, res, next) => {
  try {
    const { nome, login, email, senha, perfilId } = req.body || {};
    if (login !== undefined && (await getByLogin(login, req.params.id))) {
      return res.status(400).json({ erro: 'Login já em uso' });
    }
    const usuario = await atualizar(req.params.id, { nome, login, email, senha, perfilId });
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
    registrarLog('edicao', `Editou usuário: ${usuario.nome} (${usuario.login})`, req.session?.usuario?.id).catch(() => {});
    res.json(usuario);
  } catch (err) {
    next(err);
  }
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
router.delete('/:id', async (req, res, next) => {
  try {
    const u = await getById(req.params.id);
    if (!(await remover(req.params.id))) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    registrarLog('exclusao', `Excluiu usuário: ${u?.nome || req.params.id}`, req.session?.usuario?.id).catch(() => {});
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
