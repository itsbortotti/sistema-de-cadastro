const express = require('express');
const { getPorPerfilId } = require('../data/permissoes');

const router = express.Router();

/**
 * @swagger
 * /api/permissoes/me:
 *   get:
 *     summary: Retorna as permissões do usuário logado (do seu perfil)
 *     tags: [Permissões]
 *     responses:
 *       200: { description: Lista de permissões do perfil do usuário }
 */
router.get('/me', async (req, res, next) => {
  try {
    const perfilId = req.session?.usuario?.perfilId;
    if (!perfilId) return res.json([]);
    res.json(await getPorPerfilId(perfilId));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
