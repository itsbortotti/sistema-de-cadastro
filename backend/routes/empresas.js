const express = require('express');
const { listar, getById, criar, atualizar, remover } = require('../data/empresas');

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session?.usuario) return res.status(401).json({ erro: 'Não autenticado' });
  next();
}
router.use(requireAuth);

router.get('/', (req, res) => res.json(listar()));

router.get('/:id', (req, res) => {
  const item = getById(req.params.id);
  if (!item) return res.status(404).json({ erro: 'Não encontrado' });
  res.json(item);
});

router.post('/', (req, res) => {
  const { cnpj, razaoSocial } = req.body || {};
  if (!razaoSocial || !String(razaoSocial).trim()) {
    return res.status(400).json({ erro: 'Razão social é obrigatória' });
  }
  const item = criar(req.body);
  res.status(201).json(item);
});

router.put('/:id', (req, res) => {
  const item = atualizar(req.params.id, req.body);
  if (!item) return res.status(404).json({ erro: 'Não encontrado' });
  res.json(item);
});

router.delete('/:id', (req, res) => {
  const ok = remover(req.params.id);
  if (!ok) return res.status(404).json({ erro: 'Não encontrado' });
  res.json({ ok: true });
});

module.exports = router;
