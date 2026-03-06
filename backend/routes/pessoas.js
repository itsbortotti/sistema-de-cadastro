const express = require('express');
const { listar, getById, criar, atualizar, remover } = require('../data/pessoas');
const { validateIdParam } = require('../middleware/validateId');

const router = express.Router();
router.param('id', validateIdParam);

function formatarItem(item) {
  if (!item) return null;
  const u = { ...item };
  u.areaNome = item.area ? item.area.nome : null;
  return u;
}

router.get('/', async (req, res, next) => {
  try {
    const lista = await listar();
    res.json(Array.isArray(lista) ? lista.map(formatarItem) : []);
  } catch (err) {
    const msg = (err && err.message) ? String(err.message) : '';
    if (err.code === 'P2021' || /pessoa|findMany|prisma\.\w+/.test(msg)) {
      return res.status(503).json({
        erro: 'Modelo Pessoas não disponível. Pare o servidor, execute "npx prisma generate" no backend e reinicie.',
      });
    }
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const item = await getById(req.params.id);
    if (!item) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(formatarItem(item));
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = req.body || {};
    if (!body.nome || !String(body.nome).trim()) return res.status(400).json({ erro: 'Nome é obrigatório' });
    const item = await criar(body);
    res.status(201).json(formatarItem(await getById(item.id)));
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const item = await atualizar(req.params.id, req.body || {});
    if (!item) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(formatarItem(await getById(item.id)));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!(await remover(req.params.id))) return res.status(404).json({ erro: 'Não encontrado' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
