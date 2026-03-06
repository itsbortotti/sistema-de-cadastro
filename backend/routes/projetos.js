const express = require('express');
const { listar, getById, criar, atualizar, remover } = require('../data/projetos');
const { getById: getEmpresaById } = require('../data/empresas');
const { getById: getProdutoById } = require('../data/produtosSoftware');
const { validateIdParam } = require('../middleware/validateId');

const router = express.Router();
router.param('id', validateIdParam);

async function expandir(item) {
  const u = { ...item };
  if (item.empresaId) {
    const emp = await getEmpresaById(item.empresaId);
    const nome = emp && (emp.nomeFantasia || emp.razaoSocial || String(emp.id).trim());
    u.empresaNome = nome || null;
  }
  if (Array.isArray(item.produtoSoftwareIds) && item.produtoSoftwareIds.length > 0) {
    u.sistemaNomes = await Promise.all(
      item.produtoSoftwareIds.map(async (id) => {
        const p = await getProdutoById(id);
        return p ? (p.nomeSistema || p.id) : null;
      })
    ).then((arr) => arr.filter(Boolean));
  } else {
    u.sistemaNomes = [];
  }
  return u;
}

router.get('/', async (req, res, next) => {
  try {
    const lista = await listar();
    const expanded = await Promise.all(lista.map(expandir));
    res.json(expanded);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const item = await getById(req.params.id);
    if (!item) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(await expandir(item));
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/projetos/bulk:
 *   post:
 *     summary: Cria vários projetos em massa (importação CSV)
 *     tags: [Projetos]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items: { type: array, items: { type: object } }
 *     responses:
 *       200: { description: "Resultado: criados (number), erros (array)" }
 */
router.post('/bulk', async (req, res, next) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const erros = [];
    let criados = 0;
    for (let idx = 0; idx < items.length; idx++) {
      try {
        const body = items[idx] || {};
        if (!body.nome || !String(body.nome).trim()) {
          erros.push(`Linha ${idx + 1}: Nome do projeto é obrigatório.`);
          continue;
        }
        const ids = Array.isArray(body.produtoSoftwareIds) ? body.produtoSoftwareIds.map((x) => String(x).trim()).filter(Boolean) : [];
        if (ids.length === 0) {
          erros.push(`Linha ${idx + 1}: O projeto deve estar associado a pelo menos um sistema.`);
          continue;
        }
        await criar({ ...body, produtoSoftwareIds: ids });
        criados++;
      } catch (e) {
        erros.push(`Linha ${idx + 1}: ${e.message || 'Erro ao criar'}`);
      }
    }
    res.json({ criados, erros });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = req.body || {};
    if (!body.nome || !String(body.nome).trim()) return res.status(400).json({ erro: 'Nome do projeto é obrigatório' });
    const ids = Array.isArray(body.produtoSoftwareIds) ? body.produtoSoftwareIds.map((x) => String(x).trim()).filter(Boolean) : [];
    if (ids.length === 0) return res.status(400).json({ erro: 'O projeto deve estar associado a pelo menos um sistema.' });
    res.status(201).json(await criar(body));
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const body = { ...(req.body || {}) };
    const existente = await getById(req.params.id);
    if (!existente) return res.status(404).json({ erro: 'Não encontrado' });
    if (body.produtoSoftwareIds === undefined) body.produtoSoftwareIds = existente.produtoSoftwareIds;
    const ids = Array.isArray(body.produtoSoftwareIds) ? body.produtoSoftwareIds.map((x) => String(x).trim()).filter(Boolean) : [];
    if (ids.length === 0) return res.status(400).json({ erro: 'O projeto deve estar associado a pelo menos um sistema.' });
    const item = await atualizar(req.params.id, body);
    res.json(await expandir(item));
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
