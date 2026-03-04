const express = require('express');
const { listar, getPorTipo, salvarTodas, TIPOS, ENTIDADES } = require('../data/permissoes');
const { getById: getUsuarioById } = require('../data/usuarios');

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session?.usuario) return res.status(401).json({ erro: 'Não autenticado' });
  next();
}

function requireAdmin(req, res, next) {
  const uid = req.session?.usuario?.id;
  const u = uid ? getUsuarioById(uid) : null;
  const tipo = u?.tipo || req.session?.usuario?.tipo || 'membro';
  if (tipo !== 'admin') return res.status(403).json({ erro: 'Você não tem permissão para realizar esta ação.' });
  next();
}

router.use(requireAuth);

/**
 * @swagger
 * /api/permissoes:
 *   get:
 *     summary: Lista todas as regras de permissão (apenas admin)
 *     tags: [Configurações - Permissões]
 *     responses:
 *       200: { description: Lista de regras por tipo e entidade }
 *       403: { description: Apenas administrador }
 */
router.get('/', requireAdmin, (req, res) => {
  res.json(listar());
});

/**
 * @swagger
 * /api/permissoes/me:
 *   get:
 *     summary: Retorna as permissões do usuário logado (por tipo)
 *     tags: [Configurações - Permissões]
 *     responses:
 *       200: { description: Lista de permissões do tipo do usuário }
 */
router.get('/me', (req, res) => {
  const tipo = req.session?.usuario?.tipo || 'membro';
  res.json(getPorTipo(tipo));
});

/**
 * @swagger
 * /api/permissoes/tipos:
 *   get:
 *     summary: Lista tipos de usuário (apenas admin)
 *     tags: [Configurações - Permissões]
 *     responses:
 *       200: { description: [admin, membro, visualizacao] }
 */
router.get('/tipos', requireAdmin, (req, res) => res.json(TIPOS));

/**
 * @swagger
 * /api/permissoes/entidades:
 *   get:
 *     summary: Lista entidades do sistema (apenas admin)
 *     tags: [Configurações - Permissões]
 *     responses:
 *       200: { description: Lista de entidades }
 */
router.get('/entidades', requireAdmin, (req, res) => res.json(ENTIDADES));

/**
 * @swagger
 * /api/permissoes:
 *   put:
 *     summary: Salva todas as regras de permissão (apenas admin)
 *     tags: [Configurações - Permissões]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 tipo: { type: string }
 *                 entidade: { type: string }
 *                 visualizar: { type: boolean }
 *                 editar: { type: boolean }
 *                 criar: { type: boolean }
 *                 excluir: { type: boolean }
 *     responses:
 *       200: { description: Regras atualizadas }
 *       403: { description: Apenas administrador }
 */
router.put('/', requireAdmin, (req, res) => {
  const regras = salvarTodas(req.body);
  res.json(regras);
});

module.exports = router;
